from rest_framework import serializers
from .models import Card
from decimal import Decimal
import re


class CardCreateSerializer(serializers.Serializer):
    card_holder_name = serializers.CharField(max_length=200)
    card_number = serializers.CharField(max_length=19)  # Raw input only; never stored
    card_type = serializers.ChoiceField(choices=['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER'])
    expiry_month = serializers.IntegerField(min_value=1, max_value=12)
    expiry_year = serializers.IntegerField(min_value=2024, max_value=2040)
    is_default = serializers.BooleanField(default=False)

    def validate_card_number(self, value):
        clean = re.sub(r'\s|-', '', value)
        if not clean.isdigit() or len(clean) not in [13, 14, 15, 16, 19]:
            raise serializers.ValidationError("Invalid card number format.")
        return clean

    def create(self, validated_data):
        card_number = validated_data.pop('card_number')
        last_four = card_number[-4:]
        masked = '**** **** **** ' + last_four
        user = self.context['request'].user
        # If this is set as default, unset others
        if validated_data.get('is_default'):
            Card.objects.filter(user=user, is_default=True).update(is_default=False)
        card = Card.objects.create(
            user=user,
            last_four_digits=last_four,
            masked_number=masked,
            **validated_data
        )
        return card


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id', 'card_holder_name', 'masked_number', 'last_four_digits',
            'card_type', 'expiry_month', 'expiry_year', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'masked_number', 'last_four_digits', 'created_at']
