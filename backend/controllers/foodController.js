const Food = require('../models/Food');

const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
};

const addFood = async (req, res) => {
  try {
    const { name, price } = req.body;
    const newFood = new Food({ name, price });
    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add food item' });
  }
};

const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const updatedFood = await Food.findByIdAndUpdate(id, { name, price }, { new: true });
    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update food item' });
  }
};

const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    await Food.findByIdAndDelete(id);
    res.status(200).json({ message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete food item' });
  }
};

module.exports = { getFoods, addFood, updateFood, deleteFood };
