const moment = require('moment');
const express = require('express');
const Order = require('../models/Order'); // Assuming you already have the Order model
const Food = require('../models/Food')
const router = express.Router();
let orders = [];
// Route to fetch order summary with total sales for the day and food items sold
router.get('/summary', async (req, res) => {
  const { date } = req.query; // Expect a date in query string (DD-MM-YYYY format)

  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // End of the day

    const orders = await Order.aggregate([
      { $match: { date: moment(startDate).format('YYYY-MM-DD') } }, // Match by date field
      { $unwind: '$orders' },
      { $group: {
        _id: '$orders.foodName',
        totalQuantity: { $sum: '$orders.quantity' },
        total: { $sum: '$orders.total' }
      }},
      { $sort: { total: -1 } } // Sort by total descending
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    res.status(200).json({ orders, totalRevenue });
  } catch (error) {
    console.error('Error fetching order summary:', error);
    res.status(500).json({ message: 'Error fetching order summary' });
  }
});
router.post('/', (req, res) => {
  const { foodId, quantity } = req.body;

  // Validate request body
  if (!foodId || !quantity) {
    return res.status(400).send({ message: 'Food ID and quantity are required' });
  }

  // Create a new order object
  const newOrder = {
    id: orders.length + 1, // Simple ID generation
    foodId,
    quantity,
    orderDate: new Date() // Record the order date
  };

  // Save the order to the in-memory array
  orders.push(newOrder);

  // Send a success response
  res.status(201).send({ message: 'Order created successfully', order: newOrder });
});

// GET endpoint to retrieve all orders (for demonstration purposes)
router.get('/', async (req, res) => {
  const { date } = req.query; // Get the date parameter from the query string

  try {
    // Fetch the order entry for the specified date
    const orderEntry = await Order.findOne({ date }); // Assuming 'date' is in YYYY-MM-DD format

    if (!orderEntry || orderEntry.orders.length === 0) {
      return res.status(200).json([{}])
    }

    // Extract the foodName and quantity from each order in the orders array
    const orderDetails = orderEntry.orders.map(order => ({
      foodName: order.foodName,
      quantity: order.quantity,
      total: order.total
    }));

    res.status(200).json(orderDetails); // Send the extracted details as a JSON response
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

router.post('/checkout', async (req, res) => {
  const { orders } = req.body; // Get orders from request body
  const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  try {
    // Find or create an entry for today
    let dailyOrders = await Order.findOne({ date });

    if (!dailyOrders) {
      // If no entry for today, create one
      dailyOrders = new Order({ date, orders: [], grandTotal: 0 });
    }

    // Calculate total for each order and add to daily orders
    let dailyTotal = 0;
    const updatedOrders = await Promise.all(orders.map(async (order) => {
      const foodItem = await Food.findById(order.foodId); // Fetch food item from database
      const orderTotal = foodItem.price * order.quantity; // Calculate total for this order
      dailyTotal += orderTotal;

      return {
        foodId: order.foodId,
        foodName: foodItem.name, // Add foodName here
        quantity: order.quantity,
        total: orderTotal, // Total for this order
      };
    }));

    // Append new orders to the existing orders array
    dailyOrders.orders.push(...updatedOrders);
    dailyOrders.grandTotal += dailyTotal; // Update grand total
    await dailyOrders.save(); // Save the updated daily orders

    res.status(200).json({ message: 'Checkout successful!', orders: dailyOrders.orders, grandTotal: dailyOrders.grandTotal });
  } catch (error) {
    console.error('Error saving orders:', error);
    res.status(500).json({ message: 'Error saving orders', error });
  }
});

router.get('/last7days', async (req, res) => {
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]); // Push date in YYYY-MM-DD format
  }

  try {
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(today.setDate(today.getDate() - 7)) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group by createdAt date field
          totalSales: { $sum: "$grandTotal" } // Sum the grandTotal for each day
        }
      },
      {
        $sort: { _id: 1 } // Sort by date
      }
    ]);

    // Fill in missing days with 0 sales
    const salesData = last7Days.map(date => {
      const order = orders.find(o => o._id === date);
      return { date, totalSales: order ? order.totalSales : 0 }; // Use totalSales as sales data for plotting
    });

    res.json(salesData);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
