from rest_framework import serializers
from decimal import Decimal
from .models import Transaction
from cards.serializers import CardSerializer


class TransactionSerializer(serializers.ModelSerializer):
    card_detail = CardSerializer(source='card', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'currency', 'merchant_name', 'description',
            'status', 'reference_id', 'failure_reason',
            'card', 'card_detail', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'reference_id', 'failure_reason', 'created_at', 'updated_at']


class TransactionCreateSerializer(serializers.Serializer):
    card_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    currency = serializers.CharField(max_length=3, default='USD')
    merchant_name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
