from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, Product, Review

CATEGORIES = [
    {'name': 'Jewelry', 'slug': 'jewelry', 'image': 'https://images.unsplash.com/photo-1515562141589-62e7a3f4d8b4?w=800', 'description': 'Luxury fine jewelry and accessories'},
    {'name': 'Clothing', 'slug': 'clothing', 'image': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800', 'description': 'Designer apparel and haute couture'},
    {'name': 'Shoes', 'slug': 'shoes', 'image': 'https://images.unsplash.com/photo-1543163521-9145f931371e?w=800', 'description': 'Premium footwear for every occasion'},
    {'name': 'Bags', 'slug': 'bags', 'image': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 'description': 'Luxury handbags and accessories'},
    {'name': 'Watches', 'slug': 'watches', 'image': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'description': 'Fine timepieces and smart watches'},
    {'name': 'Accessories', 'slug': 'accessories', 'image': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800', 'description': 'Complete your look with premium accessories'},
]

PRODUCTS = [
    # Jewelry
    {'name': 'Gold Pendant Necklace', 'category': 'jewelry', 'price': 299.99, 'compare_price': 399.99, 'image': 'https://images.unsplash.com/photo-1515562141589-62e7a3f4d8b4?w=500&h=500&fit=crop', 'description': '18k gold pendant with crystal accents. A timeless piece that adds elegance to any outfit.', 'featured': True, 'badge': 'Best Seller'},
    {'name': 'Diamond Earrings', 'category': 'jewelry', 'price': 599.99, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop', 'description': 'Exquisite diamond stud earrings set in 14k white gold. 1.5 carat total weight.', 'featured': True, 'badge': 'New'},
    {'name': 'Pearl & Diamond Ring', 'category': 'jewelry', 'price': 450.00, 'compare_price': 550.00, 'image': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop', 'description': 'Elegant pearl and diamond ring in rose gold setting.', 'featured': False, 'badge': ''},
    {'name': 'Sapphire Bracelet', 'category': 'jewelry', 'price': 649.99, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop', 'description': 'Exquisite sapphire and gold bracelet with diamond accents.', 'featured': True, 'badge': 'Limited'},
    {'name': 'Gold Chain Bracelet', 'category': 'jewelry', 'price': 179.99, 'compare_price': 229.99, 'image': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop', 'description': 'Classic 14k gold chain bracelet. 8 inches with secure lobster clasp.', 'featured': False, 'badge': ''},
    {'name': 'Ruby Pendant', 'category': 'jewelry', 'price': 389.99, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1602751584552-8ba73a1a1d4c?w=500&h=500&fit=crop', 'description': 'Natural ruby pendant with diamond halo in 18k gold.', 'featured': False, 'badge': 'New'},
    {'name': 'Silver Hoop Earrings', 'category': 'jewelry', 'price': 89.99, 'compare_price': 120.00, 'image': 'https://images.unsplash.com/photo-1635767798638-3665c203b2b5?w=500&h=500&fit=crop', 'description': 'Sterling silver hoop earrings. Modern and minimalist design.', 'featured': False, 'badge': ''},
    {'name': 'Emerald Statement Ring', 'category': 'jewelry', 'price': 520.00, 'compare_price': 680.00, 'image': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop', 'description': 'Statement emerald ring with diamond accents in 14k yellow gold.', 'featured': True, 'badge': 'Featured'},

    # Clothing
    {'name': 'Silk Evening Gown', 'category': 'clothing', 'price': 450.00, 'compare_price': 580.00, 'image': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=500&fit=crop', 'description': 'Exquisite black silk evening gown with elegant draping and back detail.', 'featured': True, 'badge': 'Best Seller'},
    {'name': 'Designer Blazer', 'category': 'clothing', 'price': 380.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1539533057440-7814bae87b9f?w=500&h=500&fit=crop', 'description': 'Premium tailored blazer in navy blue. Italian wool blend.', 'featured': True, 'badge': 'New'},
    {'name': 'Cashmere Coat', 'category': 'clothing', 'price': 520.00, 'compare_price': 680.00, 'image': 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&h=500&fit=crop', 'description': 'Premium cashmere wool blend coat in cream. Fully lined.', 'featured': True, 'badge': 'Limited'},
    {'name': 'Summer Floral Dress', 'category': 'clothing', 'price': 250.00, 'compare_price': 320.00, 'image': 'https://images.unsplash.com/photo-1595777707802-4b126a5008fd?w=500&h=500&fit=crop', 'description': 'Light and breezy floral summer dress with cinched waist.', 'featured': False, 'badge': ''},
    {'name': 'Merino Wool Cardigan', 'category': 'clothing', 'price': 320.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop', 'description': 'Soft merino wool cardigan in sage green. Perfect layering piece.', 'featured': False, 'badge': ''},
    {'name': 'Linen Wide Pants', 'category': 'clothing', 'price': 280.00, 'compare_price': 350.00, 'image': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop', 'description': 'Comfortable linen wide-leg pants in cream. Elastic waistband.', 'featured': False, 'badge': ''},
    {'name': 'Leather Jacket', 'category': 'clothing', 'price': 680.00, 'compare_price': 850.00, 'image': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop', 'description': 'Genuine lambskin leather jacket with silver hardware.', 'featured': True, 'badge': 'Featured'},
    {'name': 'Tweed Skirt Suit', 'category': 'clothing', 'price': 420.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500&h=500&fit=crop', 'description': 'Chanel-inspired tweed skirt suit with gold button details.', 'featured': True, 'badge': 'New'},

    # Shoes
    {'name': 'Leather High Heels', 'category': 'shoes', 'price': 320.00, 'compare_price': 420.00, 'image': 'https://images.unsplash.com/photo-1543163521-9145f931371e?w=500&h=500&fit=crop', 'description': 'Luxury leather high heels in burgundy. 4 inch stiletto heel.', 'featured': True, 'badge': 'Best Seller'},
    {'name': 'Designer White Sneakers', 'category': 'shoes', 'price': 280.00, 'compare_price': 360.00, 'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop', 'description': 'Premium white leather designer sneakers with gold accents.', 'featured': True, 'badge': 'Popular'},
    {'name': 'Classic Oxford Loafers', 'category': 'shoes', 'price': 350.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&h=500&fit=crop', 'description': 'Classic leather oxford loafers in black. Italian leather.', 'featured': False, 'badge': ''},
    {'name': 'Ankle Boots Taupe', 'category': 'shoes', 'price': 400.00, 'compare_price': 500.00, 'image': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&h=500&fit=crop', 'description': 'Luxury leather ankle boots in taupe with side zipper.', 'featured': True, 'badge': 'New'},
    {'name': 'Evening Sandals', 'category': 'shoes', 'price': 450.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1602332610872-6d9f4f9b6e3f?w=500&h=500&fit=crop', 'description': 'Crystal embellished evening sandals with thin straps.', 'featured': False, 'badge': ''},
    {'name': 'Leather Loafers', 'category': 'shoes', 'price': 260.00, 'compare_price': 340.00, 'image': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&h=500&fit=crop', 'description': 'Italian leather penny loafers in cognac brown.', 'featured': False, 'badge': ''},
    {'name': 'Wedge Espadrilles', 'category': 'shoes', 'price': 190.00, 'compare_price': 250.00, 'image': 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=500&h=500&fit=crop', 'description': 'Summer wedge espadrilles with jute rope detailing.', 'featured': False, 'badge': ''},

    # Bags
    {'name': 'Tote Bag', 'category': 'bags', 'price': 580.00, 'compare_price': 750.00, 'image': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop', 'description': 'Classic leather tote bag with gold hardware. Spacious interior.', 'featured': True, 'badge': 'Best Seller'},
    {'name': 'Crossbody Bag', 'category': 'bags', 'price': 420.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1594226801341-41427b4e5c2d?w=500&h=500&fit=crop', 'description': 'Premium crossbody bag with adjustable strap. Multiple compartments.', 'featured': True, 'badge': 'New'},
    {'name': 'Clutch Evening Bag', 'category': 'bags', 'price': 350.00, 'compare_price': 450.00, 'image': 'https://images.unsplash.com/photo-1566154712537-f204e064b2ce?w=500&h=500&fit=crop', 'description': 'Crystal embellished clutch bag with chain strap.', 'featured': False, 'badge': ''},
    {'name': 'Leather Backpack', 'category': 'bags', 'price': 490.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 'description': 'Luxury leather backpack with padded laptop compartment.', 'featured': False, 'badge': ''},
    {'name': 'Mini Shoulder Bag', 'category': 'bags', 'price': 320.00, 'compare_price': 420.00, 'image': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop', 'description': 'Mini shoulder bag in quilted leather with gold chain.', 'featured': True, 'badge': 'Featured'},

    # Watches
    {'name': 'Luxury Mechanical Watch', 'category': 'watches', 'price': 1299.99, 'compare_price': 1599.99, 'image': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop', 'description': 'Swiss automatic movement with sapphire crystal. Leather strap.', 'featured': True, 'badge': 'Best Seller'},
    {'name': 'Gold Tone Watch', 'category': 'watches', 'price': 899.99, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&h=500&fit=crop', 'description': 'Gold tone stainless steel watch with diamond markers.', 'featured': True, 'badge': 'New'},
    {'name': 'Minimalist Leather Watch', 'category': 'watches', 'price': 450.00, 'compare_price': 580.00, 'image': 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=500&h=500&fit=crop', 'description': 'Minimalist design with genuine leather strap. Japanese quartz movement.', 'featured': False, 'badge': ''},
    {'name': 'Chronograph Sport Watch', 'category': 'watches', 'price': 780.00, 'compare_price': 950.00, 'image': 'https://images.unsplash.com/photo-1548171915-28ea3f2952f7?w=500&h=500&fit=crop', 'description': 'Sport chronograph with stainless steel bracelet. Water resistant 100m.', 'featured': False, 'badge': ''},

    # Accessories
    {'name': 'Silk Scarf', 'category': 'accessories', 'price': 180.00, 'compare_price': 240.00, 'image': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&h=500&fit=crop', 'description': 'Pure silk scarf with hand-rolled edges. 90x90cm.', 'featured': True, 'badge': 'Best Seller'},
    {'name': 'Leather Belt', 'category': 'accessories', 'price': 220.00, 'compare_price': None, 'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 'description': 'Italian leather belt with gold buckle. 3cm width.', 'featured': False, 'badge': ''},
    {'name': 'Designer Sunglasses', 'category': 'accessories', 'price': 320.00, 'compare_price': 420.00, 'image': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop', 'description': 'Premium UV400 sunglasses with gold accents.', 'featured': True, 'badge': 'New'},
    {'name': 'Leather Gloves', 'category': 'accessories', 'price': 160.00, 'compare_price': 210.00, 'image': 'https://images.unsplash.com/photo-1604603836848-1f6c09d8f3c9?w=500&h=500&fit=crop', 'description': 'Lambskin leather gloves with cashmere lining.', 'featured': False, 'badge': ''},
]


class Command(BaseCommand):
    help = 'Seed the database with luxury products'

    def handle(self, *args, **options):
        # Create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@hera.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / admin123'))

        # Create demo user
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user('demo', 'demo@hera.com', 'demo123')
            self.stdout.write(self.style.SUCCESS('Created demo user: demo / demo123'))

        # Create categories
        created_cats = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            created_cats[cat.slug] = cat
            if created:
                self.stdout.write(f'  Created category: {cat.name}')

        # Create products
        for prod_data in PRODUCTS:
            category_slug = prod_data.pop('category')
            prod_data['category'] = created_cats[category_slug]
            product, created = Product.objects.get_or_create(
                slug=prod_data['name'].lower().replace(' ', '-'),
                defaults=prod_data
            )
            if created:
                self.stdout.write(f'  Created product: {product.name}')

        # Create sample reviews
        user = User.objects.filter(username='demo').first()
        if user and not Review.objects.exists():
            products = Product.objects.all()[:10]
            reviews_data = [
                (5, 'Absolutely stunning piece! The quality exceeded my expectations.'),
                (4, 'Beautiful craftsmanship. Very happy with my purchase.'),
                (5, 'Perfect gift! The packaging was luxurious and elegant.'),
                (4, 'Great quality for the price. Would recommend.'),
                (5, 'Exceeded all expectations. Will definitely buy again.'),
                (3, 'Good product but shipping took longer than expected.'),
                (5, 'The attention to detail is incredible. Love it!'),
                (4, 'Very elegant and classy. Gets compliments everywhere.'),
                (5, 'Worth every penny. This is true luxury.'),
                (4, 'Beautiful design and comfortable to wear.'),
            ]
            for i, product in enumerate(products):
                rating, comment = reviews_data[i % len(reviews_data)]
                Review.objects.create(
                    product=product,
                    user=user,
                    rating=rating,
                    comment=comment
                )
            self.stdout.write(self.style.SUCCESS(f'Created {len(products)} sample reviews'))

        self.stdout.write(self.style.SUCCESS('\n✓ Database seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('  Admin: admin / admin123'))
        self.stdout.write(self.style.SUCCESS('  Demo:  demo / demo123'))

