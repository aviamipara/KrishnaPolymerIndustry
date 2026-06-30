from django.db import models

class RFQ(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    company = models.CharField(max_length=255)
    division = models.CharField(max_length=100)
    volume = models.CharField(max_length=100, blank=True, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rfqs'

    def __str__(self):
        return f"{self.name} - {self.company}"

class Review(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    rating = models.IntegerField()
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'

    def __str__(self):
        return f"{self.name} ({self.rating} Stars)"

class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'newsletter_subscriptions'

    def __str__(self):
        return self.email

