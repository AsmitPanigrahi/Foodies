# Foodies - Food Delivery Application

A full-stack food delivery application built with React and Node.js.

## Deployment Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Stripe account for payments

### Environment Variables

Create the following `.env` files:

#### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=your_frontend_url
```

#### Frontend (frontend/.env)
```
REACT_APP_API_URL=your_backend_api_url
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Deployment Steps

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Build and deploy:
   ```bash
   npm run deploy
   ```

4. Start the production server:
   ```bash
   npm run prod
   ```

### Production Considerations

1. Ensure all environment variables are properly set
2. Configure your web server (nginx/Apache) if needed
3. Set up SSL certificates for HTTPS
4. Configure your database backup strategy
5. Set up monitoring and logging
6. Configure proper security headers and CORS settings

## Features

- User authentication
- Food ordering system
- Real-time order tracking
- Secure payment processing with Stripe
- Responsive design

## Tech Stack

- Frontend: React, TailwindCSS
- Backend: Node.js, Express
- Database: MongoDB
- Payment Processing: Stripe
- Real-time Updates: Socket.io


updated