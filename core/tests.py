from django.test import TestCase, Client
from django.urls import reverse
from core.models import RFQ, Review, NewsletterSubscription
import json

class WebAppTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create a test user for auth tests
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.username = 'admin'
        self.password = 'admin123'
        if not User.objects.filter(username=self.username).exists():
            User.objects.create_superuser(username=self.username, email='admin@example.com', password=self.password)

    def test_pages(self):
        pages = ['index', 'about', 'products', 'manufacturing', 'contact']
        for page in pages:
            response = self.client.get(reverse(page))
            self.assertEqual(response.status_code, 200)

    def test_submit_rfq_invalid(self):
        # Empty payload
        response = self.client.post(reverse('submit_rfq'), data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
        # Missing fields
        response = self.client.post(reverse('submit_rfq'), data=json.dumps({
            'fullName': 'John Doe',
            'emailAddress': 'invalid-email',
            'companyName': '',
            'messageText': 'Test message'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        
        # Invalid email format
        response = self.client.post(reverse('submit_rfq'), data=json.dumps({
            'fullName': 'John Doe',
            'emailAddress': 'invalid-email',
            'companyName': 'Acme',
            'messageText': 'Test message'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_submit_rfq_valid(self):
        # Valid RFQ
        response = self.client.post(reverse('submit_rfq'), data=json.dumps({
            'fullName': 'John Doe',
            'emailAddress': 'john@example.com',
            'phoneNumber': '1234567890',
            'companyName': 'Acme Inc',
            'polymerDivision': 'polyolefins',
            'estimatedVolume': 'medium',
            'messageText': 'We need 5000 PET bottles.'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(RFQ.objects.count(), 1)

    def test_submit_review_invalid(self):
        # Invalid rating
        response = self.client.post(reverse('submit_review'), data=json.dumps({
            'fullName': 'John Doe',
            'emailAddress': 'john@example.com',
            'rating': '6',
            'reviewText': 'Great product'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_submit_review_valid(self):
        # Valid Review
        from unittest.mock import patch
        with patch('core.views.SendGridAPIClient') as mock_client:
            response = self.client.post(reverse('submit_review'), data=json.dumps({
                'fullName': 'John Doe',
                'emailAddress': 'john@example.com',
                'rating': '5',
                'reviewText': 'Excellent service and quality.'
            }), content_type='application/json')
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data['success'])
            self.assertEqual(Review.objects.count(), 1)

    def test_submit_newsletter_valid(self):
        # Valid Subscription
        response = self.client.post(reverse('submit_newsletter'), data=json.dumps({
            'emailAddress': 'subscribe@example.com'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(NewsletterSubscription.objects.count(), 1)

    def test_submit_newsletter_invalid(self):
        # Missing email
        response = self.client.post(reverse('submit_newsletter'), data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 400)

        # Invalid email format
        response = self.client.post(reverse('submit_newsletter'), data=json.dumps({
            'emailAddress': 'not-an-email'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_admin_dashboard(self):
        # Not logged in
        response = self.client.get(reverse('admin_dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Admin Login')
        
        # Post incorrect password
        response = self.client.post(reverse('admin_dashboard'), {
            'username': self.username,
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Incorrect username or password')

        # Post correct password
        response = self.client.post(reverse('admin_dashboard'), {
            'username': self.username,
            'password': self.password
        }, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Submitted Quote RFQs')

        # Logout
        response = self.client.get(reverse('admin_logout'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Admin Login')

    def test_delete_entry(self):
        # Create dummy RFQ, Review, Subscriber
        rfq = RFQ.objects.create(name='Test RFQ', email='test@example.com', company='Test', division='polyolefins', message='Test')
        review = Review.objects.create(name='Test Review', email='test@example.com', rating=5, review_text='Test')
        sub = NewsletterSubscription.objects.create(email='test@example.com')

        # 1. Try to delete without being logged in (should fail with 403)
        response = self.client.post(reverse('admin_delete_entry'), data=json.dumps({
            'type': 'rfq',
            'id': rfq.id
        }), content_type='application/json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(RFQ.objects.count(), 1)

        # 2. Log in
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(username=self.username)
        self.client.force_login(user)

        # 3. Delete RFQ (should succeed)
        response = self.client.post(reverse('admin_delete_entry'), data=json.dumps({
            'type': 'rfq',
            'id': rfq.id
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(RFQ.objects.count(), 0)

        # 4. Delete Review (should succeed)
        response = self.client.post(reverse('admin_delete_entry'), data=json.dumps({
            'type': 'review',
            'id': review.id
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(Review.objects.count(), 0)

        # 5. Delete Subscriber (should succeed)
        response = self.client.post(reverse('admin_delete_entry'), data=json.dumps({
            'type': 'subscriber',
            'id': sub.id
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(NewsletterSubscription.objects.count(), 0)

    def test_send_review_confirmation_success(self):
        from unittest.mock import patch, MagicMock
        from core.views import send_review_confirmation

        with patch('core.views.SendGridAPIClient') as mock_client:
            mock_instance = MagicMock()
            mock_response = MagicMock()
            mock_response.status_code = 202
            mock_instance.send.return_value = mock_response
            mock_client.return_value = mock_instance

            with patch.dict('os.environ', {'SENDGRID_API_KEY': 'SG.test_key'}):
                success = send_review_confirmation('customer@example.com')
                self.assertTrue(success)
                mock_client.assert_called_once_with('SG.test_key')
                mock_instance.send.assert_called_once()

    def test_send_review_confirmation_failure(self):
        from unittest.mock import patch, MagicMock
        from core.views import send_review_confirmation

        with patch('core.views.SendGridAPIClient') as mock_client:
            mock_instance = MagicMock()
            mock_instance.send.side_effect = Exception("SendGrid Error")
            mock_client.return_value = mock_instance

            with patch.dict('os.environ', {'SENDGRID_API_KEY': 'SG.test_key'}):
                success = send_review_confirmation('customer@example.com')
                self.assertFalse(success)

