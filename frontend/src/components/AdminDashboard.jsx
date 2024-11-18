import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodForm from './FoodForm';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [date, setDate] = useState('');
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/foods');
        if (Array.isArray(response.data)) {
          setFoods(response.data);
        } else {
          console.error('Expected an array of food items but got:', response.data);
          setFoods([]); 
        }
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };
    fetchFoods();
  }, []);

  const generatePDFReport = () => {

    const reportDate = moment(date).format('DD-MM-YYYY');
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
  
    // Set document title
    doc.setFontSize(18);
    doc.text('Order Summary Report', 14, 22);
  
    // Add date of report from the report's actual date
    doc.setFontSize(12);
    doc.text(`Date: ${reportDate}`, 14, 30);
  
    // Prepare table data
    const tableColumn = ['Food Name', 'Quantity', 'Total'];
    const tableRows = orders.map(order => [
      order.foodName,
      order.quantity,
      `$${order.total.toFixed(2)}`
    ]);
  
    // Add summary information
    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 40);
  
    // Generate table
    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [22, 160, 133], // Teal color
        textColor: 255,
      },
    });
  
    // Save the PDF
    doc.save(`Order_Summary_${reportDate}.pdf`);
  };

  const fetchOrders = async () => {
    if (date === '') {
      alert('Please select a date to fetch orders');
      return;
    }
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get('http://localhost:5000/api/orders', { params: { date: formattedDate } });
  
      // Directly use the response data since it is an array of orders
      if (response.data) {
        // Set orders to contain only foodName, quantity, and total
        const orderDetails = response.data.map(order => ({
          foodName: order.foodName,
          quantity: order.quantity,
          total: order.total // Keep total for revenue calculation
        }));
  
        setOrders(orderDetails); // Set the processed orders
        const totalRev = orderDetails.reduce((acc, order) => acc + order.total, 0); // Calculate total revenue
        setTotalRevenue(totalRev); // Set total revenue
      } else {
        setOrders([]);
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/last7days');
      const total = response.data.reduce((acc, item) => acc + item.totalSales, 0);
      setSalesData(response.data);
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/foods/${id}`);
      setFoods(foods.filter(food => food._id !== id));
    } catch (error) {
      console.error('Error deleting food item:', error);
    }
  };

  const handleUpdateFood = async (id, updatedFood) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/foods/${id}`, updatedFood);
      const updatedFoods = foods.map((food) =>
        food._id === id ? { ...food, ...response.data } : food
      );
      setFoods(updatedFoods);
    } catch (error) {
      console.error('Error updating food item:', error);
    }
  };

  useEffect(() => {
    fetchSalesData(); // Fetch sales data when the component mounts
  }, []);

  const data = {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData.map(item => item.totalSales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h1>
      <div className="absolute top-4 right-4 flex flex-col gap-4">
  <Link className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' to="/">Home</Link>
        </div>
      
      <div className="mb-6">
        <FoodForm foods={foods} setFoods={setFoods} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        
        <div className="flex items-center space-x-4">
          <input
            type="date"
            className="border p-2 rounded mb-4"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            onClick={fetchOrders}
          >
            Fetch Orders
          </button>

          {orders.length > 0 && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mb-4"
              onClick={generatePDFReport}
            >
              Export to PDF
            </button>
          )}
        </div>
        
        {orders.length > 0 && (
          <div>
            <div className="bg-yellow-200 p-4 rounded-lg mb-4 shadow-md">
              <p className="text-lg font-bold">Total Sales: ${totalRevenue.toFixed(2)}</p>
            </div>
            <h3 className="mt-4 text-lg">Fetched Orders:</h3>
            <ul>
              {orders.map((order, index) => (
                <li key={index}>
                  {order.foodName} - Quantity: {order.quantity} - Total: {order.total}
                </li>
              ))}
            </ul>
          </div>
        )}
        {orders.length === 0 && (
          <p className='text-lg text-emerald-700'>No recorded orders are available.</p>
        )}

        {/* // 7 days summary
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Sales Report - Last 7 Days</h2>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Bar data={data} />
            </div>
            <div className="bg-gray-200 p-4 rounded shadow">
              <h3 className="text-lg font-bold">Total Revenue (Last 7 Days)</h3>
              <p className="text-2xl">${totalRevenue}</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboard;