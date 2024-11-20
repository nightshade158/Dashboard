const express = require('express');
const Food = require('../models/Food');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, price } = req.body;
  try {
    const newFood = new Food({ name, price });
    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res.status(500).json({ message: 'Error adding food item' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const updatedFood = await Food.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: 'Error updating food item' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Food.findByIdAndDelete(id);
    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting food item' });
  }
});

router.get('/', async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food items' });
  }
});

module.exports = router;
