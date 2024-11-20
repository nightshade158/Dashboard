const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  date: { type: String, required: true },
  orders: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
      foodName: { type: String, required: true },
      quantity: { type: Number, required: true },
      total: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  grandTotal: { type: Number, default: 0 }
});

module.exports = mongoose.model('Order', orderSchema);