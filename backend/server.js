const express = require('express');
const cors = require('cors')
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const foodRoutes = require('./routes/foodRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors())

// Routes
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});