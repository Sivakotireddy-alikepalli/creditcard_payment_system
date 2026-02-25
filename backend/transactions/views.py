import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils.dateparse import parse_date
from .models import Transaction
from .serializers import TransactionSerializer
from cards.models import Card


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['merchant_name', 'reference_id']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user).select_related('card')
        params = self.request.query_params

        # Date filtering
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=parse_date(date_from))
        if date_to:
            queryset = queryset.filter(created_at__date__lte=parse_date(date_to))

        # Amount filtering
        amount_min = params.get('amount_min')
        amount_max = params.get('amount_max')
        if amount_min:
            queryset = queryset.filter(amount__gte=amount_min)
        if amount_max:
            queryset = queryset.filter(amount__lte=amount_max)

        return queryset


class TransactionDetailView(generics.RetrieveAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionCreateView(APIView):
    """Internal endpoint called by FastAPI to create PENDING transaction"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        card_id = request.data.get('card_id')
        amount = request.data.get('amount')
        merchant_name = request.data.get('merchant_name', 'Unknown Merchant')
        description = request.data.get('description', '')
        currency = request.data.get('currency', 'USD')

        try:
            card = Card.objects.get(id=card_id, user=request.user)
        except Card.DoesNotExist:
            return Response({'error': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)

        reference_id = str(uuid.uuid4()).replace('-', '')[:20].upper()
        transaction = Transaction.objects.create(
            user=request.user,
            card=card,
            amount=amount,
            currency=currency,
            merchant_name=merchant_name,
            description=description,
            status='PENDING',
            reference_id=reference_id,
        )
        return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)


class TransactionUpdateStatusView(APIView):
    """Called by FastAPI to update transaction status after processing"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, reference_id):
        try:
            transaction = Transaction.objects.get(reference_id=reference_id)
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        failure_reason = request.data.get('failure_reason', '')

        if new_status not in ['SUCCESS', 'FAILED']:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        transaction.status = new_status
        transaction.failure_reason = failure_reason
        transaction.save()
        return Response(TransactionSerializer(transaction).data)
