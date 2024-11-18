import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/foods');
        if (Array.isArray(response.data)) {
          setFoods(response.data);
        } else {
          console.error('Error: Food items should be an array');
        }
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };
    fetchFoods();
  }, []);

  const handleQuantityChange = (e, foodId) => {
    const updatedFoods = foods.map((food) => {
      if (food._id === foodId) {
        setQuantity(Number(e.target.value));
        return { ...food, quantity: Number(e.target.value) };
      }
      return food;
    });
    setFoods(updatedFoods);
  };

  const handleAddToCart = async () => {
    if (!selectedFood) {
      alert('Please select a food item.');
      return;
    }

    try {
      const newOrder = { foodId: selectedFood._id, quantity };
      await axios.post('http://localhost:5000/api/orders', newOrder);
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      alert('Food item added to cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleCheckout = async () => {
    if (orders.length === 0) {
      alert('Your cart is empty. Please add items to checkout.');
      return;
    }
  
    // Calculate total price and prepare orders for sending
    const updatedOrders = await Promise.all(orders.map(async (order) => {
      const response = await axios.get(`/api/foods/${order.foodId}`); // Fetch food item from API
      const foodItem = response.data; // Get food item from the response
      const orderTotal = foodItem.price * order.quantity; // Calculate total for this order
    
      return {
        foodId: order.foodId,
        foodName: foodItem.name, // Get the food name from the foodItem
        quantity: order.quantity,
        total: orderTotal, // Total for this order
      };
    }));
    
    try {
      // Send updated orders to the backend
      const response = await axios.post('http://localhost:5000/api/orders/checkout', { orders: updatedOrders });
      
      // Display success message with grand total
      alert(`Checkout successful! Total price: $${response.data.grandTotal.toFixed(2)}`);
  
      // Optionally, clear the orders after checkout
      setOrders([]);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('There was an error processing your checkout. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">User  Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Food Items</h2>
        {foods.length > 0 ? (
          foods.map((food) => (
            <div key={food._id} className="flex justify-between items-center mb-4">
              <span>{food.name} - ${food.price}</span>
              <div>
                <input
                  type="number"
                  min="1"
                  value={food.quantity || 0}
                  onChange={(e) => handleQuantityChange(e, food._id)}
                  className="border p-2 rounded mr-2"
                />
                <button
                  className={`bg-green-500 text-white px-4 py-2 rounded ${selectedFood === food ? 'bg-green-800' : ''}`}
                  onClick={() => setSelectedFood(food)}
                >
                  Select
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No food items available.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        {orders.length > 0 ? (
          orders.map((order, index) => {
            const foodItem = foods.find(food => food._id === order.foodId);
            return (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>{foodItem.name} x {order.quantity}</span>
                <span>${(foodItem.price * order.quantity).toFixed(2)}</span>
              </div>
            );
          })
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      <div className="mt-4">
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;