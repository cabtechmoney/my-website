import requests
from django.conf import settings

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY = settings.PAYSTACK_PUBLIC_KEY

def initialize_transaction(email, amount, reference, callback_url):
    url = 'https://api.paystack.co/transaction/initialize'
    headers = {
        'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}',
        'Content-Type': 'application/json',
    }
    data = {
        'email': email,
        'amount': int(amount * 100),  # kobo
        'reference': reference,
        'callback_url': callback_url,
    }
    response = requests.post(url, json=data, headers=headers)
    return response.json()

def verify_transaction(reference):
    url = f'https://api.paystack.co/transaction/verify/{reference}'
    headers = {'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}'}
    response = requests.get(url, headers=headers)
    return response.json()