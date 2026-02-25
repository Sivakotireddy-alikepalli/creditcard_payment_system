from django.db import models
from django.conf import settings


class Card(models.Model):
    CARD_TYPE_CHOICES = [
        ('VISA', 'Visa'),
        ('MASTERCARD', 'Mastercard'),
        ('AMEX', 'American Express'),
        ('DISCOVER', 'Discover'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cards'
    )
    card_holder_name = models.CharField(max_length=200)
    # SECURITY: Only last 4 digits stored; full number NEVER stored
    last_four_digits = models.CharField(max_length=4)
    masked_number = models.CharField(max_length=20)  # e.g. **** **** **** 1234
    card_type = models.CharField(max_length=20, choices=CARD_TYPE_CHOICES, default='OTHER')
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cards'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.card_holder_name} - {self.masked_number}"
