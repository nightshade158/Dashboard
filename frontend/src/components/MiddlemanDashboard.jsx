import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodForm from './FoodForm';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Navbar from './Navbar';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MiddlemanDashboard = () => {
  const location = useLocation(); // Get the location object
  const [foods, setFoods] = useState([]); // State for food items
  const [orders, setOrders] = useState([]); // State for orders
  const [totalRevenue, setTotalRevenue] = useState(0); // State for total revenue
  const [sumRevenue, setSumRevenue] = useState(0); // State for sum revenue from last 7 days
  const [date, setDate] = useState(''); // State for selected date
  const [salesData, setSalesData] = useState([]); // State for sales data
  const [features, setFeatures] = useState(location.state?.features || []); // State for features
  const [username, setUsername] = useState(''); // State for username
  const navigate = useNavigate(); // Hook for navigation

  // Fetch food items on component mount
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

  // Fetch food items if the feature 'manageFoods' is available
  useEffect(() => {
    if (features.includes('manageFoods')) {
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
    }
  }, [features]);

  // Fetch sales data for the last 7 days
  const fetchSalesData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/last7days');
      if (response.data && Array.isArray(response.data.salesData)) {
        const total = response.data.sumTotal; // Use sumTotal from the response
        setSalesData(response.data.salesData); // Set salesData from the response
        setSumRevenue(total); // Set totalRevenue from sumTotal
      } else {
        console.error('Expected sales data to be an array but got:', response.data);
        setSalesData([]);
        setSumRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData(); // Fetch sales data on component mount
  }, []);

  // Fetch orders based on the selected date
  const fetchOrders = async () => {
    if (date === '') {
      alert('Please select a date to fetch orders');
      return;
    }
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get('http://localhost:5000/api/orders', { params: { date: formattedDate } });

      if (response.data) {
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

  // Generate PDF report of orders
  const generatePDFReport = () => {
    const reportDate = moment(date).format('DD-MM-YYYY');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order Summary Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${reportDate}`, 14, 30);
    const tableColumn = ['Food Name', 'Quantity', 'Total'];
    const tableRows = orders.map(order => [
      order.foodName,
      order.quantity,
      `$${order.total.toFixed(2)}`
    ]);
    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 40);
    doc.autoTable({
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
      },
    });
    doc.save(`Order_Summary_${reportDate}.pdf`);
  };

  const data = {
    labels: salesData.map(item => moment(item.date).format('YYYY-MM-DD')),
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData.map(item => item.totalSales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
          },
        },
      },
      title: {
        display: true,
        text: 'Sales Data for Last 7 Days',
        font: {
          size: 20,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sales ($)',
          font: {
            size: 16,
          },
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div>
      <div style={{
        backgroundImage: `url(${assets.fastfood})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
      }}>
        <div className="max-w-6xl mx-auto p-6 border-hidden rounded-lg shadow-md" style={{
          background: 'linear-gradient(to right, orange, yellow, white)',
        }}>
          <Navbar name={"Middleman Dashboard"} />
          {features.includes('manageFoods') && (
            <div className="mb-6">
              <FoodForm foods={foods} setFoods={setFoods} />
            </div>
          )}
          <div className='mt-8'>
            {features.includes('getDailyOrders') && (
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
                    <h3 className="mt-4 font-bold text-lg">Fetched Orders:</h3>
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
              </div>
            )}
            {features.includes('getWeeklySales') && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Sales Report - Last 7 Days</h2>
                <div className="flex justify-between items-center mb-4">
                  <div style={{ width: '450px', height: '450px', padding: '20px', backgroundColor: 'transparent', borderRadius: '8px' }}>
                    <Bar
                      data={data}
                      options={options}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                  <div className="bg-gray-200 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out mx-auto my-4" style={{ width: 'fit-content' }}>
                    <h3 className="text-lg font-bold text-gray-800">Total Revenue (Last 7 Days)</h3>
                    <p className="text-2xl text-gray-900 font-semibold">${sumRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {features.length === 0 && <p>No features assigned to you.</p>}
        </div>
      </div>
    </div>
  );
};

export default MiddlemanDashboard;