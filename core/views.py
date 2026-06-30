import os
import smtplib
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import re
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from core.models import RFQ, Review, NewsletterSubscription

logger = logging.getLogger(__name__)

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
EMAIL_REGEX = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

def send_sendgrid_email(subject, body_text, to_email):
    """Sends an email notification using SendGrid Web API."""
    api_key = os.environ.get('SENDGRID_API_KEY')
    from_email = os.environ.get('SENDGRID_FROM_EMAIL', 'krishnapolyind@gmail.com')
    
    # Local development fallback if SendGrid is not configured
    if not api_key or api_key == 'YOUR_SENDGRID_API_KEY_HERE':
        logger.warning("SENDGRID_API_KEY is not set. Saving email content to sent_emails/ directory.")
        try:
            os.makedirs('sent_emails', exist_ok=True)
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
            filename = f"sent_emails/sendgrid-{timestamp}-{to_email}.log"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"Subject: {subject}\n")
                f.write(f"From: {from_email}\n")
                f.write(f"To: {to_email}\n")
                f.write(f"Date: {datetime.datetime.now()}\n\n")
                f.write(body_text)
            logger.info(f"Mock email successfully saved to {filename}")
            return True
        except Exception as e:
            logger.error(f"Failed to save mock email locally: {str(e)}")
            return False
        
    import urllib.request
    import json
    
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "personalizations": [{
            "to": [{"email": to_email}],
            "subject": subject
        }],
        "from": {"email": from_email, "name": "Krishna Polymer Industries"},
        "content": [{
            "type": "text/plain",
            "value": body_text
        }]
    }
    
    try:
        import ssl
        context = ssl._create_unverified_context()
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode('utf-8'), 
            headers=headers, 
            method='POST'
        )
        with urllib.request.urlopen(req, context=context) as response:
            status_code = response.getcode()
            if status_code in [200, 201, 202]:
                logger.info(f"Successfully sent SendGrid email to {to_email}")
                return True
            else:
                logger.error(f"SendGrid API returned status code {status_code}")
                return False
    except Exception as e:
        logger.error(f"Failed to send email via SendGrid: {str(e)}")
        return False

def send_review_confirmation(user_email):
    """Sends a thank-you review confirmation HTML email using the SendGrid SDK."""
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'your-verified-sender@domain.com')
    subject = "Thank you for submitting your review!"
    
    html_content = """
    <html>
        <body>
            <h2 style="color: #333;">Thank You!</h2>
            <p>Dear Customer,</p>
            <p>Thank you for submitting your review! We sincerely appreciate you taking the time to share your feedback with us.</p>
            <p>Your input helps us maintain our commitment to global quality standards.</p>
            <p>Best regards,<br>
            <strong>Krishna Polymer Industries Team</strong></p>
        </body>
    </html>
    """
    
    message = Mail(
        from_email=from_email,
        to_emails=user_email,
        subject=subject,
        html_content=html_content
    )
    
    try:
        api_key = os.environ.get('SENDGRID_API_KEY')
        if not api_key:
            raise ValueError("SENDGRID_API_KEY is not set in the environment.")
        
        import ssl
        old_context = getattr(ssl, '_create_default_https_context', None)
        try:
            ssl._create_default_https_context = ssl._create_unverified_context
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)
        finally:
            if old_context:
                ssl._create_default_https_context = old_context
        
        logger.info(f"SendGrid confirmation email sent successfully. Status code: {response.status_code}")
        print(f"SendGrid confirmation email sent successfully. Status code: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Failed to send review confirmation email via SendGrid: {str(e)}")
        print(f"Failed to send review confirmation email via SendGrid: {str(e)}")
        return False

def send_smtp_email(subject, body_text, to_email):
    """Sends an email notification via SMTP, using environment variables for credentials."""
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_username = os.environ.get('SMTP_USERNAME', 'krishnapolyind@gmail.com')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not smtp_password:
        logger.warning("SMTP_PASSWORD is not set. Email notification skipped.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body_text, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent SMTP notification email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {str(e)}")
        return False


# --- Page Routers ---

def index(request):
    return render(request, 'index.html')

def about(request):
    return render(request, 'about.html')

def products(request):
    return render(request, 'products.html')

def manufacturing(request):
    return render(request, 'manufacturing.html')

def contact(request):
    return render(request, 'contact.html')

# --- API Endpoints ---

@csrf_exempt
def submit_rfq(request):
    """Handles RFQ submissions, validates inputs, and persists to SQLite database."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        import json
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)

    if not data:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)

    name = data.get('fullName', '').strip()
    email = data.get('emailAddress', '').strip()
    phone = data.get('phoneNumber', '').strip()
    message = data.get('messageText', '').strip()
    whatsapp_consent = data.get('whatsappConsent', False)

    # Backend validations
    if not name or not email or not phone:
        return JsonResponse({'success': False, 'message': 'Missing required fields.'}, status=400)

    if not EMAIL_REGEX.match(email):
        return JsonResponse({'success': False, 'message': 'Please enter a valid email address.'}, status=400)

    try:
        # Format message to include WhatsApp consent in DB record
        db_message = message
        if whatsapp_consent:
            db_message += "\n\n[WhatsApp Contact Consent: Yes]"

        # Save to database using Django ORM
        rfq = RFQ(
            name=name,
            email=email,
            phone=phone,
            company="N/A",
            division="Contact Enquiry",
            volume="N/A",
            message=db_message
        )
        rfq.save()

        # Send Email Notification to Admin
        subject = f"New Contact/Enquiry from {name}"
        body = f"""Hello Admin,

A new contact form enquiry has been submitted on the website.

Customer Name: {name}
Email Address: {email}
Phone Number: {phone}
WhatsApp Contact Consent: {"Yes" if whatsapp_consent else "No"}

Message Details:
{message or 'N/A'}

---
This email was generated automatically by the Krishna Polymer Industries website.
"""
        admin_email = os.environ.get('SENDGRID_FROM_EMAIL', 'aviamipara5220@gmail.com')
        send_sendgrid_email(subject, body, admin_email)

        # Send SendGrid confirmation copy to user
        user_subject = "Krishna Polymer Industries - Contact Request Received"
        user_body = f"""Dear {name},

Thank you for reaching out to Krishna Polymer Industries. We have received your message/enquiry and our team is currently processing it.

Here are the details we received from you:
- Phone Number: {phone}
- WhatsApp Contact: {"Yes" if whatsapp_consent else "No"}
- Your Message:
{message or 'N/A'}

Our team will contact you within 24 business hours.

Best regards,
Krishna Polymer Industries Team
"""
        send_sendgrid_email(user_subject, user_body, email)

        return JsonResponse({
            'success': True,
            'message': 'Thank you! Your enquiry has been received. Our team will contact you within 24 business hours.'
        })

    except Exception as e:
        logger.error(f"Error saving RFQ to db: {str(e)}")
        return JsonResponse({'success': False, 'message': 'An internal server error occurred while processing your request.'}, status=500)

@csrf_exempt
def submit_review(request):
    """Handles Customer Review submissions, validates inputs, and persists to SQLite database."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        import json
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)

    if not data:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)

    name = data.get('fullName', '').strip()
    email = data.get('emailAddress', '').strip()
    rating_val = data.get('rating')
    review_text = data.get('reviewText', '').strip()

    # Backend validations
    if not name or not email or not review_text:
        return JsonResponse({'success': False, 'message': 'Missing required fields.'}, status=400)

    if not EMAIL_REGEX.match(email):
        return JsonResponse({'success': False, 'message': 'Please enter a valid email address.'}, status=400)

    try:
        rating = int(rating_val)
        if rating < 1 or rating > 5:
            raise ValueError
    except (TypeError, ValueError):
        return JsonResponse({'success': False, 'message': 'Rating must be an integer between 1 and 5.'}, status=400)

    try:
        # Save to database using Django ORM
        review = Review(
            name=name,
            email=email,
            rating=rating,
            review_text=review_text
        )
        review.save()

        # Send Email Notification to Admin
        subject = f"New Customer Review Received from {name}"
        body = f"""Hello Admin,

A new customer review has been submitted on the website.

Customer Name: {name}
Email Address: {email}
Rating: {rating} / 5 Stars

Review Feedback:
{review_text}

---
This email was generated automatically by the Krishna Polymer Industries website.
"""
        admin_email = os.environ.get('SENDGRID_FROM_EMAIL', 'aviamipara5220@gmail.com')
        send_sendgrid_email(subject, body, admin_email)

        # Send HTML review confirmation email using SendGrid SDK
        send_review_confirmation(email)

        return JsonResponse({
            'success': True,
            'message': 'Thank you! Your review has been submitted successfully.'
        })

    except Exception as e:
        logger.error(f"Error saving review to db: {str(e)}")
        return JsonResponse({'success': False, 'message': 'An internal server error occurred while processing your request.'}, status=500)

@csrf_exempt
def submit_newsletter(request):
    """Handles newsletter subscriptions, validates email, saves to db, and sends SendGrid welcome email."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)

    try:
        import json
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)

    if not data:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)

    email = data.get('emailAddress', '').strip()

    if not email:
        return JsonResponse({'success': False, 'message': 'Missing email address.'}, status=400)

    if not EMAIL_REGEX.match(email):
        return JsonResponse({'success': False, 'message': 'Please enter a valid email address.'}, status=400)

    try:
        # Check if already subscribed
        exists = NewsletterSubscription.objects.filter(email=email).exists()
        if exists:
            return JsonResponse({'success': True, 'message': 'You are already subscribed to our newsletter!'})

        # Save subscription
        sub = NewsletterSubscription(email=email)
        sub.save()

        # Send SendGrid welcome email to user
        subject = "Welcome to Krishna Polymer Industries Newsletter"
        body = f"""Hello,

Thank you for subscribing to the Krishna Polymer Industries newsletter!

We are excited to share the latest updates on our high-quality PET bottles, caps, agricultural packaging solutions, and polymer manufacturing innovations.

Best regards,
Communications Team
Krishna Polymer Industries
"""
        send_sendgrid_email(subject, body, email)

        # Notify admin of new newsletter subscription
        admin_subject = f"New Newsletter Subscription: {email}"
        admin_body = f"""Hello Admin,

A new user has subscribed to the Krishna Polymer Industries newsletter.

Subscriber Email: {email}

---
This email was generated automatically by the Krishna Polymer Industries website.
"""
        admin_email = os.environ.get('SENDGRID_FROM_EMAIL', 'aviamipara5220@gmail.com')
        send_sendgrid_email(admin_subject, admin_body, admin_email)

        return JsonResponse({
            'success': True,
            'message': 'Thank you! You have successfully subscribed to our newsletter.'
        })

    except Exception as e:
        logger.error(f"Error in submit_newsletter: {str(e)}")
        return JsonResponse({'success': False, 'message': 'An internal server error occurred.'}, status=500)

# --- Secure Admin Panel Dashboard ---

@csrf_exempt
def admin_dashboard(request):
    """Handles admin authentication and renders the quote submissions list."""
    error = None

    if request.method == 'POST':
        # Handle login attempt
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:
            login(request, user)
            return redirect('admin_dashboard')
        else:
            error = 'Incorrect username or password. Please try again.'

    # Check if admin is authenticated
    if not request.user.is_authenticated or not request.user.is_staff:
        # Render Admin Login Panel
        return render(request, 'admin.html', {
            'login_required': True,
            'error': error
        })

    # Admin is authenticated, fetch submitted quotes, reviews, and newsletter subscribers
    # Convert querysets to dictionaries using .values() for Jinja2 template dict-access compatibility
    quotes = list(RFQ.objects.all().order_by('-id').values())
    reviews = list(Review.objects.all().order_by('-id').values())
    subscribers = list(NewsletterSubscription.objects.all().order_by('-id').values())

    # Calculate basic stats
    total_quotes = len(quotes)
    total_reviews = len(reviews)
    total_subscribers = len(subscribers)
    
    # Calculate average rating
    avg_rating = 0.0
    if total_reviews > 0:
        avg_rating = round(sum(r['rating'] for r in reviews) / total_reviews, 1)
    
    # Division stats counts
    divisions_count = {'polyolefins': 0, 'engineering': 0, 'performance': 0, 'machined': 0}
    for q in quotes:
        div = q['division']
        if div in divisions_count:
            divisions_count[div] += 1
        else:
            divisions_count['machined'] += 1

    return render(request, 'admin.html', {
        'login_required': False,
        'quotes': quotes,
        'total_quotes': total_quotes,
        'stats': divisions_count,
        'reviews': reviews,
        'total_reviews': total_reviews,
        'avg_rating': avg_rating,
        'subscribers': subscribers,
        'total_subscribers': total_subscribers
    })

@csrf_exempt
def delete_entry(request):
    """Secure endpoint for admin to delete an entry (RFQ, Review, or Subscriber)."""
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Unauthorized access.'}, status=403)
        
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed.'}, status=405)
        
    try:
        import json
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'success': False, 'message': 'Invalid payload data.'}, status=400)
        
    entry_type = data.get('type')
    entry_id = data.get('id')
    
    if not entry_type or not entry_id:
        return JsonResponse({'success': False, 'message': 'Missing parameters.'}, status=400)
        
    try:
        if entry_type == 'rfq':
            RFQ.objects.filter(id=entry_id).delete()
        elif entry_type == 'review':
            Review.objects.filter(id=entry_id).delete()
        elif entry_type == 'subscriber':
            NewsletterSubscription.objects.filter(id=entry_id).delete()
        else:
            return JsonResponse({'success': False, 'message': 'Invalid entry type.'}, status=400)
            
        return JsonResponse({'success': True, 'message': 'Entry deleted successfully.'})
    except Exception as e:
        logger.error(f"Error deleting entry: {str(e)}")
        return JsonResponse({'success': False, 'message': 'Database error occurred.'}, status=500)

@csrf_exempt
def admin_logout(request):
    """Logs out the admin and clears session data."""
    logout(request)
    return redirect('admin_dashboard')

