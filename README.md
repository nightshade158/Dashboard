# Dashboard Project

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [License](#license)

---

## Overview
This project is a full-stack dashboard application designed for food order management. It features role-based dashboards for Admins, Users, and Middlemen, providing a seamless experience for managing food items, placing orders, and tracking sales. The frontend is built with React, Vite, and Tailwind CSS, while the backend uses Node.js, Express, and MongoDB.

## Features
- **Role-based Authentication:** Admin, User, and Middleman dashboards
- **Food Management:** Add, update, delete, and list food items (Admin)
- **Order Management:** Place orders, checkout, and view order summaries
- **Sales Analytics:** Visualize sales data with charts (Admin)
- **PDF Reports:** Generate downloadable order summary reports (Admin)
- **Middleman Management:** Add and manage middlemen and their features (Admin)
- **Responsive UI:** Modern, mobile-friendly interface

## Tech Stack
### Frontend
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [jsPDF](https://github.com/parallax/jsPDF)

### Backend
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [dotenv](https://www.npmjs.com/package/dotenv)

## Project Structure
```
Dashboard/
  frontend/      # React + Vite frontend
    src/
      components/  # Main React components (AdminDashboard, UserDashboard, etc.)
      assets/      # Static assets
      App.jsx      # Main app entry
    package.json   # Frontend dependencies
    ...
  backend/       # Node.js + Express backend
    routes/      # API route handlers (userRoutes, foodRoutes, orderRoutes)
    models/      # Mongoose data models (User, Food, Order)
    controllers/ # (if any)
    server.js    # Backend entry point
    package.json # Backend dependencies
```

## Setup Instructions
### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Dashboard
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file with your MongoDB URI and JWT secret
# Example .env:
# MONGO_URI=mongodb://localhost:27017/dashboard
# JWT_SECRET=your_jwt_secret
npm start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will typically run on [http://localhost:5173](http://localhost:5173) and the backend on [http://localhost:5000](http://localhost:5000). Set up env files in frontend directory and backend directory. The env file in frontend directory
should have a variable VITE_DOMAIN=your_domain_ip and the env file in backend should have the variable MONGODB_URI=mongodb_connection_string.

---

## API Documentation
### User Routes
- `POST /api/users/signup` — Register a new user
- `POST /api/users/login` — User login
- `POST /api/users/addmiddleman` — Add a middleman (Admin only)
- `GET /api/users/middlemanfeatures?username=...` — Get features for a middleman
- `GET /api/users/middlemen` — List all middlemen
- `POST /api/users/editmiddlefeatures` — Edit middleman features

### Food Routes
- `GET /api/foods` — List all food items
- `POST /api/foods` — Add a new food item (Admin only)
- `PUT /api/foods/:id` — Update a food item (Admin only)
- `DELETE /api/foods/:id` — Delete a food item (Admin only)

### Order Routes
- `POST /api/orders` — Place a new order
- `POST /api/orders/checkout` — Checkout cart
- `GET /api/orders?date=YYYY-MM-DD` — Get orders for a specific date
- `GET /api/orders/summary?date=YYYY-MM-DD` — Get order summary for a date
- `GET /api/orders/last7days` — Get sales data for the last 7 days

---

## Data Models
### User
```js
{
  username: String,
  password: String (hashed),
  authId: String,
  isadmin: Boolean,
  ismiddle: Boolean,
  email: String,
  features: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Food
```js
{
  name: String,
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```js
{
  date: String,
  orders: [
    {
      foodId: ObjectId,
      foodName: String,
      quantity: Number,
      total: Number,
      createdAt: Date
    }
  ],
  grandTotal: Number
}
```

---

## License
This project is licensed under the [ISC License](LICENSE) (or specify your license). 
