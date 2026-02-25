import csv
from django.http import HttpResponse
from django.db.models import Sum, Count
from django.utils.dateparse import parse_date
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from accounts.models import User
from accounts.serializers import UserSerializer
from cards.models import Card
from cards.serializers import CardSerializer
from transactions.models import Transaction, AdminLog
from transactions.serializers import TransactionSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


def log_admin_action(admin, action, target_model, target_id='', description='', request=None):
    ip = None
    if request:
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            ip = x_forwarded.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
    AdminLog.objects.create(
        admin=admin, action=action, target_model=target_model,
        target_id=str(target_id), description=description, ip_address=ip
    )


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            allowed = ('is_active', 'is_admin')
            for field in allowed:
                if field in request.data:
                    setattr(user, field, request.data[field])
            user.save()
            log_admin_action(request.user, 'UPDATE', 'User', pk, f'Updated user {user.email}', request)
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            email = user.email
            user.delete()
            log_admin_action(request.user, 'DELETE', 'User', pk, f'Deleted user {email}', request)
            return Response({'message': 'User deleted.'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminCardListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CardSerializer
    queryset = Card.objects.select_related('user').all()


class AdminTransactionListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.select_related('user', 'card').all()
        params = self.request.query_params
        status_filter = params.get('status')
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        user_id = params.get('user_id')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=parse_date(date_from))
        if date_to:
            queryset = queryset.filter(created_at__date__lte=parse_date(date_to))
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset


class AdminDailySummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models.functions import TruncDate
        summary = (
            Transaction.objects
            .annotate(date=TruncDate('created_at'))
            .values('date', 'status')
            .annotate(count=Count('id'), total=Sum('amount'))
            .order_by('-date')
        )
        return Response(list(summary))


class AdminExportTransactionsCSV(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'User Email', 'Card Masked', 'Amount', 'Currency',
                         'Merchant', 'Status', 'Reference ID', 'Created At'])
        qs = Transaction.objects.select_related('user', 'card').all()
        for txn in qs:
            writer.writerow([
                txn.id, txn.user.email if txn.user else '',
                txn.card.masked_number if txn.card else '',
                txn.amount, txn.currency, txn.merchant_name,
                txn.status, txn.reference_id,
                txn.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        log_admin_action(request.user, 'EXPORT', 'Transaction', description='CSV Export', request=request)
        return response


class AdminLogListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = AdminLog.objects.select_related('admin').all()[:200]
        data = [{
            'id': log.id,
            'admin': log.admin.email if log.admin else None,
            'action': log.action,
            'target_model': log.target_model,
            'target_id': log.target_id,
            'description': log.description,
            'timestamp': log.timestamp,
        } for log in logs]
        return Response(data)
