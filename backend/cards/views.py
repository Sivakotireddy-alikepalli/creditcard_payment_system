from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Card
from .serializers import CardSerializer, CardCreateSerializer


class CardListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cards = Card.objects.filter(user=request.user)
        serializer = CardSerializer(cards, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CardCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            card = serializer.save()
            return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CardDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Card.objects.get(pk=pk, user=user)
        except Card.DoesNotExist:
            return None

    def get(self, request, pk):
        card = self.get_object(pk, request.user)
        if not card:
            return Response({'error': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CardSerializer(card).data)

    def patch(self, request, pk):
        card = self.get_object(pk, request.user)
        if not card:
            return Response({'error': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Allow updating is_default and card_holder_name only
        allowed_fields = ('is_default', 'card_holder_name')
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        if data.get('is_default'):
            Card.objects.filter(user=request.user, is_default=True).update(is_default=False)
        for attr, value in data.items():
            setattr(card, attr, value)
        card.save()
        return Response(CardSerializer(card).data)

    def delete(self, request, pk):
        card = self.get_object(pk, request.user)
        if not card:
            return Response({'error': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)
        card.delete()
        return Response({'message': 'Card deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
