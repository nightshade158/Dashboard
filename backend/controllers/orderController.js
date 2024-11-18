const Order = require('../models/Order');

// Controller to fetch orders
const getOrders = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const orders = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + order.totalRevenue, 0);

    res.status(200).json({ orders, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Controller to create a new order
const createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body); // Assuming order data is in the request body
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

module.exports = { getOrders, createOrder };
