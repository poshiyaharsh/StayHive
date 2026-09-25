from decimal import Decimal
from rest_framework import serializers, viewsets, permissions, filters
from rest_framework.decorators import action
from apps.core.models import OfferPackage
from apps.core.utils import api_response, api_error
from apps.billing.services import quantize_money


class OfferPackageSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = OfferPackage
        fields = ['id', 'hotel_id', 'hotel_name', 'code', 'title', 'description', 'discount_percentage', 'min_booking_amount', 'valid_from', 'valid_to', 'is_active', 'usage_count']


class OfferPackageViewSet(viewsets.ModelViewSet):
    queryset = OfferPackage.objects.all().order_by('-discount_percentage')
    serializer_class = OfferPackageSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=False, methods=['post'])
    def validate_code(self, request):
        code = request.data.get('code', '').strip().upper()
        raw_amount = request.data.get('amount', 0)
        try:
            amount = quantize_money(Decimal(str(raw_amount)))
        except Exception:
            return api_error("Invalid amount specified")

        offer = OfferPackage.objects.filter(code=code, is_active=True).first()
        if not offer:
            return api_error("Invalid or expired coupon code")

        if amount < offer.min_booking_amount:
            return api_error(f"Minimum booking amount for this offer is ₹{offer.min_booking_amount}")

        discount = quantize_money((amount * offer.discount_percentage) / Decimal('100.00'))
        final_amount = quantize_money(amount - discount)

        return api_response(
            success=True,
            message="Offer applied successfully!",
            data={
                "offer_id": offer.id,
                "code": offer.code,
                "title": offer.title,
                "discount_percentage": float(offer.discount_percentage),
                "discount_amount": float(discount),
                "final_amount": float(final_amount)
            }
        )
