# Hera Palace

Hera Palace is a React and Django REST e-commerce demo with a luxury storefront, guest cart and wishlist, JWT authentication, orders, reviews, contact messages, and newsletter subscriptions.

## Run locally

Start the frontend:

```bash
npm install
npm run dev
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Configure and start the backend:

```bash
copy hera-backend\.env.example hera-backend\.env
cd hera-backend
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Set the frontend API base URL to an absolute URL ending in `/api`, for example `VITE_API_BASE_URL=http://localhost:8000/api` in a local frontend `.env` file. Set the same variable to the deployed backend URL in the frontend's production environment.

## Payments

Checkout is deliberately a simulated payment gate. It validates the form locally and requires an explicit acknowledgement, but never submits, stores, or charges card data. Use a payment provider such as Stripe or Paystack before accepting real payments.

## Production notes

Set `DJANGO_DEBUG=false`, a strong `DJANGO_SECRET_KEY`, restrictive `DJANGO_ALLOWED_HOSTS`, and explicit `CORS_ALLOWED_ORIGINS` before deployment.
