const mongoose = require('mongoose');

// Define the Food Schema
const foodSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, { timestamps: true }); // Timestamps to keep track of creation and modification times

// Create the model for the food collection
const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
