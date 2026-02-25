from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.logout_url = reverse('logout')
        self.profile_url = reverse('profile')
        self.valid_user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'SecurePass@123',
            'password2': 'SecurePass@123',
            'first_name': 'Test',
            'last_name': 'User',
        }

    def test_register_success(self):
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'test@example.com')

    def test_register_duplicate_email(self):
        self.client.post(self.register_url, self.valid_user_data, format='json')
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        data = {**self.valid_user_data, 'password2': 'DifferentPass@123'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_email(self):
        data = {**self.valid_user_data}
        data.pop('email')
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(email='login@test.com', username='loginuser', password='SecurePass@123')
        response = self.client.post(self.login_url, {
            'email': 'login@test.com',
            'password': 'SecurePass@123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        User.objects.create_user(email='login2@test.com', username='loginuser2', password='SecurePass@123')
        response = self.client.post(self.login_url, {
            'email': 'login2@test.com',
            'password': 'WrongPassword'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        reg_resp = self.client.post(self.register_url, self.valid_user_data, format='json')
        token = reg_resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_success(self):
        reg_resp = self.client.post(self.register_url, self.valid_user_data, format='json')
        access = reg_resp.data['tokens']['access']
        refresh = reg_resp.data['tokens']['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        response = self.client.post(self.logout_url, {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_refresh_token(self):
        reg_resp = self.client.post(self.register_url, self.valid_user_data, format='json')
        token = reg_resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_not_plaintext_in_db(self):
        reg_resp = self.client.post(self.register_url, self.valid_user_data, format='json')
        user = User.objects.get(email='test@example.com')
        self.assertNotEqual(user.password, 'SecurePass@123')
        self.assertTrue(user.password.startswith('pbkdf2_'))
