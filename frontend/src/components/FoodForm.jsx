import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FoodForm = ({ foods, setFoods }) => {
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [editingFood, setEditingFood] = useState(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://3.85.103.160:5000/api/foods');
        setFoods(response.data);
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };
    fetchFoods();
  }, [setFoods]);

  const handleAddFood = async () => {
    if (!foodName || !foodPrice) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const newFood = { name: foodName, price: parseFloat(foodPrice) };
      const response = await axios.post('http://3.85.103.160:5000/api/foods', newFood);
      setFoods((prevFoods) => [...prevFoods, response.data]);
      setFoodName('');
      setFoodPrice('');
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const handleUpdateFood = async () => {
    if (!foodName || !foodPrice || !editingFood) {
      alert('Please fill out all fields or select a food to edit.');
      return;
    }

    try {
      const updatedFood = { name: foodName, price: parseFloat(foodPrice) };
      const response = await axios.put(`http://3.85.103.160:5000/api/foods/${editingFood._id}`, updatedFood);
      setFoods((prevFoods) =>
        prevFoods.map((food) => food._id === editingFood._id ? response.data : food)
      );
      setFoodName('');
      setFoodPrice('');
      setEditingFood(null);
    } catch (error) {
      console.error('Error updating food:', error);
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await axios.delete(`http://3.85.103.160:5000/api/foods/${id}`);
      setFoods((prevFoods) => prevFoods.filter((food) => food._id !== id));
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Manage Food Items</h2>
      <input
        type="text"
        className="border p-2 rounded mb-2"
        placeholder="Food Name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />
      <input
        type="number"
        className="border p-2 rounded mb-2"
        placeholder="Food Price"
        value={foodPrice}
        onChange={(e) => setFoodPrice(e.target.value)}
      />
      <div className="flex space-x-4 mt-2">
        {editingFood ? (
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded"
            onClick={handleUpdateFood}
          >
            Update Food
          </button>
        ) : (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleAddFood}
          >
            Add Food
          </button>
        )}
      </div>

      <h3 className="mt-6 text-lg font-semibold">Food List</h3>
      <div className="mt-2">
        {Array.isArray(foods) && foods.length > 0 ? (
          <ul className="space-y-2">
            {foods.map((food) => (
              <li key={food._id} className="flex justify-between items-center">
                <span>{food.name} - ${food.price}</span>
                <div>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => {
                      setFoodName(food.name);
                      setFoodPrice(food.price);
                      setEditingFood(food);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDeleteFood(food._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No food items available.</p>
        )}
      </div>
    </div>
  );
};

export default FoodForm;