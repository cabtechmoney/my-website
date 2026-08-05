from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Product, Cart, CartItem, Order, Wishlist, WishlistItem, Review


@override_settings(SECURE_SSL_REDIRECT=False)
class HeraPalaceAPITests(APITestCase):
    """
    Comprehensive test suite for the Hera Palace API.
    """

    def setUp(self):
        # Create test users
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )

        # Create categories
        self.category = Category.objects.create(
            name='Jewelry',
            slug='jewelry',
            description='Fine jewelry'
        )
        self.category2 = Category.objects.create(
            name='Clothing',
            slug='clothing',
            description='Designer apparel'
        )

        # Create products
        self.product = Product.objects.create(
            category=self.category,
            name='Gold Pendant',
            slug='gold-pendant',
            description='A stunning gold pendant.',
            price=299.99,
            compare_price=399.99,
            image='https://picsum.photos/seed/gold/500/500',
            stock=10,
            featured=True,
            badge='Best Seller'
        )
        self.product2 = Product.objects.create(
            category=self.category2,
            name='Silk Dress',
            slug='silk-dress',
            description='Elegant silk evening dress.',
            price=450.00,
            image='https://picsum.photos/seed/silk/500/500',
            stock=5
        )
        self.product_out_of_stock = Product.objects.create(
            category=self.category,
            name='Out of Stock',
            slug='out-of-stock',
            description='No stock left.',
            price=100.00,
            image='https://picsum.photos/seed/out/500/500',
            stock=0
        )

        # Create a cart for the user
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )

        # Create a wishlist item
        self.wishlist = Wishlist.objects.create(user=self.user)
        self.wishlist.items.create(product=self.product)

        # Create a review
        self.review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            comment='Excellent product!'
        )

        # Helper: get JWT token
        self.token = self.get_token(self.user)

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def auth_header(self, token=None):
        token = token or self.token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    # ---- AUTH TESTS ----

    def test_register_user(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login(self):
        url = reverse('token_obtain_pair')
        data = {'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_fail(self):
        url = reverse('token_obtain_pair')
        data = {'username': 'testuser', 'password': 'wrong'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieve(self):
        url = reverse('user-detail')
        response = self.client.get(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_profile_update(self):
        url = reverse('user-detail')
        data = {'first_name': 'Updated', 'last_name': 'Name'}
        response = self.client.put(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    # ---- CATEGORY TESTS ----

    def test_list_categories(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # two categories

    # ---- PRODUCT TESTS ----

    def test_list_products(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return all products (3)
        self.assertGreaterEqual(len(response.data), 3)

    def test_product_filter_search(self):
        url = reverse('product-list') + '?search=pendant'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Gold Pendant')

    def test_product_filter_category(self):
        url = reverse('product-list') + '?category=jewelry'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # gold pendant + out of stock

    def test_product_filter_price_range(self):
        url = reverse('product-list') + '?min_price=300&max_price=500'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # silk dress only

    def test_product_filter_featured(self):
        url = reverse('product-list') + '?featured=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # gold pendant

    def test_product_detail(self):
        url = reverse('product-detail', kwargs={'slug': self.product.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Gold Pendant')
        self.assertIn('average_rating', response.data)
        self.assertIn('reviews', response.data)
        self.assertEqual(len(response.data['reviews']), 1)

    # ---- CART TESTS ----

    def test_get_cart(self):
        url = reverse('cart')
        response = self.client.get(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 2)
        self.assertEqual(len(response.data['items']), 1)

    def test_add_to_cart_new_item(self):
        url = reverse('cart')
        data = {'product_id': self.product2.id, 'quantity': 3}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 5)  # 2 existing + 3 new
        # Verify cart item exists
        self.assertTrue(CartItem.objects.filter(cart=self.cart, product=self.product2).exists())

    def test_add_to_cart_existing_increases_quantity(self):
        url = reverse('cart')
        data = {'product_id': self.product.id, 'quantity': 2}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 4)

    def test_add_to_cart_exceeds_stock(self):
        url = reverse('cart')
        data = {'product_id': self.product.id, 'quantity': 20}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', response.data['error'].lower())

    def test_update_cart_item(self):
        url = reverse('cart-item', kwargs={'item_id': self.cart_item.id})
        data = {'quantity': 5}
        response = self.client.put(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cart_item.refresh_from_db()
        self.assertEqual(self.cart_item.quantity, 5)

    def test_update_cart_item_exceeds_stock(self):
        url = reverse('cart-item', kwargs={'item_id': self.cart_item.id})
        data = {'quantity': 20}
        response = self.client.put(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', response.data['error'].lower())

    def test_delete_cart_item(self):
        url = reverse('cart-item', kwargs={'item_id': self.cart_item.id})
        response = self.client.delete(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(CartItem.objects.filter(id=self.cart_item.id).exists())

    def test_clear_cart(self):
        url = reverse('cart')
        response = self.client.delete(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 0)

    def test_cart_requires_auth(self):
        url = reverse('cart')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ---- ORDER TESTS ----

    def test_create_order_success(self):
        url = reverse('orders')
        data = {
            'shipping_address': '123 Luxury Lane',
            'city': 'Lagos',
            'zip_code': '100001',
            'phone': '+2348123456789',
            'notes': 'Leave at gate'
        }
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(user=self.user)
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.total, Decimal('599.98'))  # 2 items in cart
        # Stock reduced
        self.assertEqual(order.total, Decimal('599.98'))
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)  # 10 - 2
        # Cart cleared
        self.assertFalse(self.cart.items.exists())

    def test_create_order_empty_cart(self):
        # Clear cart first
        self.cart.items.all().delete()
        url = reverse('orders')
        data = {'shipping_address': '123', 'city': 'Lagos', 'zip_code': '100001'}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('empty', response.data['error'].lower())

    def test_create_order_insufficient_stock(self):
        # Add out-of-stock product to cart
        CartItem.objects.create(cart=self.cart, product=self.product_out_of_stock, quantity=1)
        url = reverse('orders')
        data = {'shipping_address': '123', 'city': 'Lagos', 'zip_code': '100001'}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', response.data['error'].lower())

    def test_list_orders(self):
        # Create an order first
        order = Order.objects.create(
            user=self.user,
            total=100.00,
            shipping_address='123',
            city='Lagos',
            zip_code='100001'
        )
        url = reverse('orders')
        response = self.client.get(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], order.id)

    def test_order_detail(self):
        order = Order.objects.create(
            user=self.user,
            total=100.00,
            shipping_address='123',
            city='Lagos',
            zip_code='100001'
        )
        url = reverse('order-detail', kwargs={'order_id': order.id})
        response = self.client.get(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], order.id)

    def test_order_detail_other_user(self):
        order = Order.objects.create(
            user=self.admin,
            total=100.00,
            shipping_address='123',
            city='Lagos',
            zip_code='100001'
        )
        url = reverse('order-detail', kwargs={'order_id': order.id})
        response = self.client.get(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ---- WISHLIST TESTS ----

    def test_get_wishlist(self):
        url = reverse('wishlist')
        response = self.client.get(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['product_detail']['id'], self.product.id)

    def test_add_to_wishlist(self):
        url = reverse('wishlist')
        data = {'product_id': self.product2.id}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['action'], 'added')
        self.assertTrue(self.wishlist.items.filter(product=self.product2).exists())

    def test_remove_from_wishlist(self):
        url = reverse('wishlist')
        data = {'product_id': self.product.id}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'removed')
        self.assertFalse(self.wishlist.items.filter(product=self.product).exists())

    def test_delete_wishlist_item(self):
        item = self.wishlist.items.first()
        url = reverse('wishlist-item', kwargs={'item_id': item.id})
        response = self.client.delete(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(WishlistItem.objects.filter(id=item.id).exists())

    def test_clear_wishlist(self):
        url = reverse('wishlist')
        response = self.client.delete(url, **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.wishlist.items.exists())

    # ---- REVIEW TESTS ----

    def test_get_reviews_for_product(self):
        url = reverse('product-reviews', kwargs={'product_slug': self.product.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['rating'], 5)

    def test_post_review_authenticated(self):
        url = reverse('product-reviews', kwargs={'product_slug': self.product2.slug})
        data = {'rating': 4, 'comment': 'Nice dress.'}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Review.objects.filter(product=self.product2, user=self.user).exists())

    def test_post_review_unauthenticated(self):
        url = reverse('product-reviews', kwargs={'product_slug': self.product2.slug})
        data = {'rating': 4, 'comment': 'Nice dress.'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_existing_review(self):
        url = reverse('product-reviews', kwargs={'product_slug': self.product.slug})
        data = {'rating': 3, 'comment': 'Updated comment.'}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.review.refresh_from_db()
        self.assertEqual(self.review.rating, 3)
        self.assertEqual(self.review.comment, 'Updated comment.')

    # ---- CONTACT TESTS ----

    def test_contact_form_valid(self):
        url = reverse('contact')
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'subject': 'Inquiry',
            'message': 'I love your products!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Message sent successfully!')

    def test_contact_form_invalid(self):
        url = reverse('contact')
        data = {'name': 'John'}  # missing email, message
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---- NEWSLETTER TESTS ----

    def test_newsletter_subscribe_valid(self):
        url = reverse('newsletter')
        data = {'email': 'new@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Subscribed successfully!')

    def test_newsletter_subscribe_duplicate(self):
        # First subscribe
        self.client.post(reverse('newsletter'), {'email': 'dup@example.com'}, format='json')
        # Try again
        response = self.client.post(reverse('newsletter'), {'email': 'dup@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---- PAYMENT TESTS ----

    @patch('api.payments.requests.post')
    def test_initialize_payment_success(self, mock_post):
        # Mock Paystack response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'status': True,
            'data': {
                'authorization_url': 'https://paystack.com/pay/test',
            }
        }
        mock_post.return_value = mock_response

        # Create an order first
        order = Order.objects.create(
            user=self.user,
            total=299.99,
            shipping_address='123',
            city='Lagos',
            zip_code='100001'
        )
        url = reverse('initialize-payment')
        data = {'order_id': order.id}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('authorization_url', response.data)
        self.assertIn('reference', response.data)
        order.refresh_from_db()
        self.assertIsNotNone(order.reference)
        self.assertTrue(order.reference.startswith('HERA-'))

    @patch('api.payments.requests.post')
    def test_initialize_payment_failure(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'status': False,
            'message': 'Invalid amount'
        }
        mock_post.return_value = mock_response

        order = Order.objects.create(
            user=self.user,
            total=299.99,
            shipping_address='123',
            city='Lagos',
            zip_code='100001'
        )
        url = reverse('initialize-payment')
        data = {'order_id': order.id}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_initialize_payment_order_not_found(self):
        url = reverse('initialize-payment')
        data = {'order_id': 999}
        response = self.client.post(url, data, format='json', **self.auth_header())
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_initialize_payment_unauthenticated(self):
        url = reverse('initialize-payment')
        data = {'order_id': 1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('api.payments.verify_transaction')
    def test_paystack_webhook_success(self, mock_verify):
        # Mock verification response
        mock_verify.return_value = {
            'status': True,
            'data': {'status': 'success'}
        }
        order = Order.objects.create(
            user=self.user,
            total=299.99,
            shipping_address='123',
            city='Lagos',
            zip_code='100001',
            reference='HERA-abc123'
        )
        url = reverse('paystack-webhook')
        payload = {
            'event': 'charge.success',
            'data': {'reference': 'HERA-abc123'}
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')

    def test_paystack_webhook_other_event(self):
        url = reverse('paystack-webhook')
        payload = {'event': 'charge.failed', 'data': {'reference': 'HERA-xyz'}}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # No order status change

    # ---- PERMISSION TESTS ----

    def test_cart_requires_authentication(self):
        urls = [
            reverse('cart'),
            reverse('cart-item', kwargs={'item_id': 1}),
        ]
        for url in urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_orders_require_authentication(self):
        urls = [
            reverse('orders'),
            reverse('order-detail', kwargs={'order_id': 1}),
        ]
        for url in urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)