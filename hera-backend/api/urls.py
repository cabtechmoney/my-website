from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/me/', views.UserDetailView.as_view(), name='user-detail'),

    # Cart
    path('cart/', views.cart_view, name='cart'),
    path('cart/<int:item_id>/', views.cart_item_view, name='cart-item'),

    # Orders
    path('orders/', views.order_view, name='orders'),
    path('orders/<int:order_id>/', views.order_detail_view, name='order-detail'),

    # Wishlist
    path('wishlist/', views.wishlist_view, name='wishlist'),
    path('wishlist/<int:item_id>/', views.wishlist_item_view, name='wishlist-item'),

    # Reviews
    path('products/<slug:product_slug>/reviews/', views.review_view, name='product-reviews'),

    # Contact & Newsletter
    path('contact/', views.contact_view, name='contact'),
    path('newsletter/', views.newsletter_view, name='newsletter'),

    path('payments/initialize/', views.initialize_payment, name='initialize-payment'),
    path('payments/webhook/', views.paystack_webhook, name='paystack-webhook'),
]

urlpatterns += router.urls

