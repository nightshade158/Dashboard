const moment = require('moment');
const express = require('express');
const Order = require('../models/Order');
const Food = require('../models/Food')
const router = express.Router();
let orders = [];
router.get('/summary', async (req, res) => {
  const { date } = req.query;

  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const orders = await Order.aggregate([
      { $match: { date: moment(startDate).format('YYYY-MM-DD') } },
      { $unwind: '$orders' },
      {
        $group: {
          _id: '$orders.foodName',
          totalQuantity: { $sum: '$orders.quantity' },
          total: { $sum: '$orders.total' }
        }
      },
      { $sort: { total: -1 } }
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

  if (!foodId || !quantity) {
    return res.status(400).send({ message: 'Food ID and quantity are required' });
  }

  const newOrder = {
    id: orders.length + 1,
    foodId,
    quantity,
    orderDate: new Date()
  };

  orders.push(newOrder);

  res.status(201).send({ message: 'Order created successfully', order: newOrder });
});

router.get('/', async (req, res) => {
  const { date } = req.query;

  try {
    const orderEntry = await Order.findOne({ date });

    if (!orderEntry || orderEntry.orders.length === 0) {
      return res.status(200).json([])
    }

    const orderDetails = orderEntry.orders.map(order => ({
      foodName: order.foodName,
      quantity: order.quantity,
      total: order.total
    }));

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    // Validate input
    const { orders } = req.body;
    
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const date = new Date().toISOString().split('T')[0];

    // Find or create daily order record
    let dailyOrders = await Order.findOne({ date });

    if (!dailyOrders) {
      dailyOrders = new Order({ date, orders: [], grandTotal: 0 });
    }

    // Process orders
    const updatedOrders = [];
    let dailyTotal = 0;

    for (const order of orders) {
      // Validate each order
      if (!order.foodId || !order.quantity) {
        return res.status(400).json({ message: 'Invalid order structure' });
      }

      // Find food item
      const foodItem = await Food.findById(order.foodId);
      
      if (!foodItem) {
        return res.status(404).json({ message: `Food item not found: ${order.foodId}` });
      }

      // Calculate order total
      const orderTotal = foodItem.price * order.quantity;
      dailyTotal += orderTotal;

      // Prepare order details
      const orderDetails = {
        foodId: order.foodId,
        foodName: foodItem.name,
        quantity: order.quantity,
        total: orderTotal,
      };

      updatedOrders.push(orderDetails);
    }

    // Update daily orders
    dailyOrders.orders.push(...updatedOrders);
    dailyOrders.grandTotal += dailyTotal;
    
    // Save the updated order
    await dailyOrders.save();

    // Respond with success
    res.status(200).json({ 
      message: 'Checkout successful!', 
      orders: dailyOrders.orders, 
      grandTotal: dailyOrders.grandTotal 
    });

  } catch (error) {
    console.error('Error saving orders:', error);
    res.status(500).json({ 
      message: 'Error processing checkout', 
      error: error.message 
    });
  }
});

router.get('/last7days', async (req, res) => {
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  try {
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    const orders = await Order.aggregate([
      {
        $match: {
          date: { $gte: startDate.toISOString().split('T')[0] }
        }
      },
      {
        $group: {
          _id: "$date",
          totalSales: { $sum: "$grandTotal" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const salesMap = orders.reduce((acc, order) => {
      acc[order._id] = order.totalSales;
      return acc;
    }, {});

    const salesData = last7Days.map(date => {
      const totalSales = salesMap[date] || 0;
      return { date, totalSales };
    });

    const sumTotal = salesData.reduce((sum, day) => sum + day.totalSales, 0);

    res.json({ salesData, sumTotal });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
