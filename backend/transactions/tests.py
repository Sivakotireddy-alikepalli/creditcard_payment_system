import uuid
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from cards.models import Card
from .models import Transaction

User = get_user_model()


class TransactionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='txnuser@test.com', username='txnuser', password='SecurePass@123'
        )
        self.client.force_authenticate(user=self.user)
        self.card = Card.objects.create(
            user=self.user,
            card_holder_name='Test User',
            last_four_digits='1111',
            masked_number='**** **** **** 1111',
            card_type='VISA',
            expiry_month=12,
            expiry_year=2027,
        )

    def _create_transaction(self, status_val='SUCCESS'):
        return Transaction.objects.create(
            user=self.user,
            card=self.card,
            amount='100.00',
            currency='USD',
            merchant_name='Test Shop',
            status=status_val,
            reference_id=str(uuid.uuid4()).replace('-', '')[:20].upper()
        )

    def test_list_transactions(self):
        self._create_transaction('SUCCESS')
        self._create_transaction('FAILED')
        response = self.client.get(reverse('transaction-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 2)

    def test_filter_by_status(self):
        self._create_transaction('SUCCESS')
        self._create_transaction('FAILED')
        response = self.client.get(reverse('transaction-list') + '?status=SUCCESS')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for txn in response.data['results']:
            self.assertEqual(txn['status'], 'SUCCESS')

    def test_filter_by_amount_min(self):
        t1 = self._create_transaction()
        t1.amount = 50
        t1.save()
        t2 = self._create_transaction()
        t2.amount = 200
        t2.save()
        response = self.client.get(reverse('transaction-list') + '?amount_min=100')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for txn in response.data['results']:
            self.assertGreaterEqual(float(txn['amount']), 100)

    def test_transaction_create_pending(self):
        response = self.client.post(reverse('transaction-create'), {
            'card_id': self.card.id,
            'amount': '250.00',
            'merchant_name': 'Amazon',
            'description': 'Test payment',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')
        self.assertIn('reference_id', response.data)

    def test_update_transaction_status(self):
        txn = self._create_transaction('PENDING')
        response = self.client.patch(
            reverse('transaction-update-status', args=[txn.reference_id]),
            {'status': 'SUCCESS'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'SUCCESS')

    def test_invalid_status_update(self):
        txn = self._create_transaction('PENDING')
        response = self.client.patch(
            reverse('transaction-update-status', args=[txn.reference_id]),
            {'status': 'INVALID'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
