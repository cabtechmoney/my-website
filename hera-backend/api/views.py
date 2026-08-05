from decimal import Decimal, InvalidOperation

from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from .models import (
    Category, Product, Cart, CartItem, Order, OrderItem,
    Wishlist, WishlistItem, Review, ContactMessage, NewsletterSubscriber
)
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, OrderCreateSerializer,
    WishlistSerializer, WishlistItemSerializer,
    ReviewSerializer, RegisterSerializer, UserSerializer,
    ContactSerializer, NewsletterSerializer
)
import uuid
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from .models import Order
from . import payments

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initialize_payment(request):
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'error': 'order_id is required'}, status=400)
    
    try:
        order = Order.objects.get(id=order_id, user=request.user, status='pending')
    except Order.DoesNotExist:
        return Response({'error': 'Order not found or already paid'}, status=404)
    
    reference = f'HERA-{uuid.uuid4().hex[:10]}'
    order.reference = reference
    order.save(update_fields=['reference'])
    
    response = payments.initialize_transaction(
        email=request.user.email,
        amount=float(order.total),
        reference=reference,
        callback_url=settings.PAYSTACK_CALLBACK_URL
    )
    
    if response.get('status'):
        return Response({
            'authorization_url': response['data']['authorization_url'],
            'reference': reference
        })
    else:
        return Response(
            {'error': response.get('message', 'Payment initialization failed')},
            status=400
        )
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        product = get_object_or_404(Product, id=product_id)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        if not created:
            item.delete()
            return Response({'action': 'removed'})
        return Response({'action': 'added'}, status=201)
    # ... GET and DELETE stay as before
@api_view(['POST'])
@permission_classes([AllowAny])
def paystack_webhook(request):
    # Verify signature? For simplicity, we trust the request.
    payload = request.data
    event = payload.get('event')
    if event == 'charge.success':
        reference = payload['data']['reference']
        verification = payments.verify_transaction(reference)
        if verification.get('status') and verification.get('data', {}).get('status') == 'success':
            try:
                order = Order.objects.get(reference=reference)
                order.status = 'paid'
                order.save(update_fields=['status'])
                # Optionally reduce stock further or send confirmation email
            except Order.DoesNotExist:
                pass
    return Response({'status': 'ok'})


def get_quantity(value):
    try:
        quantity = int(value)
    except (TypeError, ValueError):
        return None
    return quantity if quantity > 0 else None


# ── Categories ──
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    pagination_class = None


# ── Products ──
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related('category').all()
    lookup_field = 'slug'
    pagination_class = None

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        search = params.get('search', '')
        category = params.get('category', '')
        min_price = params.get('min_price')
        max_price = params.get('max_price')
        featured = params.get('featured', '')
        ordering = params.get('ordering', '-created_at')

        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        if category:
            qs = qs.filter(category__slug=category)
        if min_price:
            try:
                qs = qs.filter(price__gte=Decimal(min_price))
            except (InvalidOperation, TypeError):
                raise ValidationError({'min_price': 'Invalid decimal value.'})
        if max_price:
            try:
                qs = qs.filter(price__lte=Decimal(max_price))
            except (InvalidOperation, TypeError):
                raise ValidationError({'max_price': 'Invalid decimal value.'})
        if featured and featured.lower() == 'true':
            qs = qs.filter(featured=True)

        allowed_ordering = {'price', '-price', 'name', '-name', 'created_at', '-created_at'}
        if ordering in allowed_ordering:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by('-created_at')

        return qs


# ── Cart ──
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    elif request.method == 'POST':
        product_id = request.data.get('product_id')
        quantity = get_quantity(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)
        if quantity is None:
            return Response({'error': 'quantity must be a positive integer'}, status=400)

        product = get_object_or_404(Product, id=product_id)
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            if item.quantity + quantity > product.stock:
                return Response({'error': 'Requested quantity exceeds available stock'}, status=400)
            item.quantity += quantity
            item.save()
        elif quantity > product.stock:
            item.delete()
            return Response({'error': 'Requested quantity exceeds available stock'}, status=400)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def cart_item_view(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)

    if request.method == 'PUT':
        quantity = get_quantity(request.data.get('quantity', 1))
        if quantity is None:
            return Response({'error': 'quantity must be a positive integer'}, status=400)
        if quantity > item.product.stock:
            return Response({'error': 'Requested quantity exceeds available stock'}, status=400)
        item.quantity = quantity
        item.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


# ── Orders ──
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_view(request):
    if request.method == 'GET':
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        with transaction.atomic():
            cart = get_object_or_404(Cart.objects.select_for_update(), user=request.user)
            cart_items = list(cart.items.select_related('product').select_for_update())
            if not cart_items:
                return Response({'error': 'Cart is empty'}, status=400)
            if any(item.quantity > item.product.stock for item in cart_items):
                return Response({'error': 'One or more products no longer have enough stock'}, status=400)

            total = sum(item.product.price * item.quantity for item in cart_items)
            order = Order.objects.create(
                user=request.user,
                total=total,
                **serializer.validated_data
            )

            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_price=cart_item.product.price,
                    quantity=cart_item.quantity
                )
                cart_item.product.stock -= cart_item.quantity
                cart_item.product.save(update_fields=['stock'])

            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail_view(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)


# ── Wishlist ──
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

    elif request.method == 'POST':
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)

        product = get_object_or_404(Product, id=product_id)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        if not created:
            item.delete()
            return Response({'action': 'removed'})

        return Response({'action': 'added'}, status=201)

    elif request.method == 'DELETE':
        wishlist.items.all().delete()
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_item_view(request, item_id):
    wishlist = get_object_or_404(Wishlist, user=request.user)
    item = get_object_or_404(WishlistItem, id=item_id, wishlist=wishlist)
    item.delete()
    serializer = WishlistSerializer(wishlist)
    return Response(serializer.data)


# ── Reviews ──
@api_view(['GET', 'POST'])
def review_view(request, product_slug):
    product = get_object_or_404(Product, slug=product_slug)

    if request.method == 'GET':
        reviews = product.reviews.select_related('user').all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        serializer = ReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        review, created = Review.objects.update_or_create(
            product=product, user=request.user,
            defaults={'rating': serializer.validated_data['rating'],
                      'comment': serializer.validated_data['comment']}
        )

        return Response(ReviewSerializer(review).data, status=201)


# ── Auth ──
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  # allow partial updates
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

# ── Contact ──
@api_view(['POST'])
@permission_classes([AllowAny])
def contact_view(request):
    serializer = ContactSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Message sent successfully!'}, status=201)
    return Response(serializer.errors, status=400)


# ── Newsletter ──
@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_view(request):
    serializer = NewsletterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Subscribed successfully!'}, status=201)
    return Response(serializer.errors, status=400)

