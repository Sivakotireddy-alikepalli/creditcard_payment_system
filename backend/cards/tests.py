from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class CardTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='carduser@test.com',
            username='carduser',
            password='SecurePass@123'
        )
        self.client.force_authenticate(user=self.user)
        self.cards_url = reverse('card-list-create')

    def _add_card(self, card_number='4111111111111111'):
        return self.client.post(self.cards_url, {
            'card_holder_name': 'Test User',
            'card_number': card_number,
            'card_type': 'VISA',
            'expiry_month': 12,
            'expiry_year': 2027,
            'is_default': True
        }, format='json')

    def test_add_card_success(self):
        response = self._add_card()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['masked_number'], '**** **** **** 1111')
        self.assertEqual(response.data['last_four_digits'], '1111')

    def test_card_number_not_stored(self):
        """Full card number must NEVER appear in the response"""
        response = self._add_card()
        self.assertNotIn('card_number', response.data)
        self.assertNotIn('4111111111111111', str(response.data))

    def test_cvv_not_stored(self):
        """CVV must never be accepted or stored"""
        response = self.client.post(self.cards_url, {
            'card_holder_name': 'Test',
            'card_number': '4111111111111111',
            'card_type': 'VISA',
            'expiry_month': 12,
            'expiry_year': 2027,
            'cvv': '123',  # should be silently ignored
        }, format='json')
        self.assertNotIn('cvv', response.data)

    def test_list_cards(self):
        self._add_card('4111111111111111')
        self._add_card('5500005555555559')
        response = self.client.get(self.cards_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_delete_card(self):
        add_resp = self._add_card()
        card_id = add_resp.data['id']
        del_resp = self.client.delete(reverse('card-detail', args=[card_id]))
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_cannot_access_other_users_card(self):
        add_resp = self._add_card()
        card_id = add_resp.data['id']
        other = User.objects.create_user(
            email='other@test.com', username='otheruser', password='SecurePass@123'
        )
        other_client = APIClient()
        other_client.force_authenticate(user=other)
        response = other_client.get(reverse('card-detail', args=[card_id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_card_number(self):
        response = self.client.post(self.cards_url, {
            'card_holder_name': 'Test',
            'card_number': '123',
            'card_type': 'VISA',
            'expiry_month': 12,
            'expiry_year': 2027,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
