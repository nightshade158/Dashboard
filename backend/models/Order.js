const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Store date in YYYY-MM-DD format
  orders: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      foodName: { type: String, required: true},
      quantity: { type: Number, required: true },
      total: { type: Number, required: true }, // Total price for this order
      createdAt: { type: Date, default: Date.now } // Optional: to track when each order was added
    }
  ],
  grandTotal: { type: Number, default: 0 } // Grand total for the day
});

module.exports = mongoose.model('Order', orderSchema);