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
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sumRevenue, setSumRevenue] = useState(0);
  const [date, setDate] = useState('');
  const [salesData, setSalesData] = useState([]);
  const navigate = useNavigate();

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

  // PDF generation
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
      // Check if response contains salesData and sumTotal
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
    fetchSalesData();
  }, []);

  // Function to navigate to AddMiddleman component
  const handleAddMiddleman = () => {
    navigate('/addmiddleman'); // Redirect to AddMiddleman page
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
        barPercentage: 0.6, // Adjust the width of the bars
        categoryPercentage: 0.8, // Adjust the spacing between bars
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill the container
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16, // Increase font size for legend
          },
        },
      },
      title: {
        display: true,
        text: 'Sales Data for Last 7 Days',
        font: {
          size: 20, // Increase font size for title
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 16, // Increase font size for x-axis title
          },
        },
        ticks: {
          font: {
            size: 14, // Increase font size for x-axis labels
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sales ($)',
          font: {
            size: 16, // Increase font size for y-axis title
          },
        },
        ticks: {
          font: {
            size: 14, // Increase font size for y-axis labels
          },
        },
      },
    },
  };

  return (
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
        <Navbar name={"Admin Dashboard"} />
        <div className="text-2xl font-bold text-center mb-6"></div>

        {/* Manage Food items section starts */}
        <div className="mb-6">
          <FoodForm foods={foods} setFoods={setFoods} />
          <div className="absolute top-48 right-72 flex flex-col gap-4"> {/* Changed to absolute positioning */}
    <button className='relative overflow-hidden rounded-lg px-20 py-6' onClick={handleAddMiddleman}>
        <span className='absolute inset-px flex items-center justify-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-50'>Add Middleman</span>
        <span aria-hidden className='absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-ping before:bg-gradient-to-r before:from-purple-700 before:via-red-500 before:to-amber-400'/>
    </button>
</div>
        </div>
        {/* Manage Food items section ends */}

        {/* Daily Orders Summary section starts */}
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

          {/* Weekly Sales Report section starts*/}

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Sales Report - Last 7 Days</h2>
            <div className="flex justify-between items-center mb-4">
              <div style={{ width: '450px', height: '450px', padding: '20px', backgroundColor: 'transparent', borderRadius: '8px' }}>
                <Bar
                  data={data}
                  options={options}
                  style={{ height: '100%', width: '100%' }} // Ensure the chart fills the container
                />
              </div>
              <div className="bg-gray-200 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out mx-auto my-4" style={{ width: 'fit-content' }}>
                <h3 className="text-lg font-bold text-gray-800">Total Revenue (Last 7 Days)</h3>
                <p className="text-2xl text-gray-900 font-semibold">${sumRevenue.toFixed(2)}</p>
              </div>

              <style jsx>{
                `.bg - gray - 200 {
                  background: linear-gradient(135deg, #e2e8f0, #edf2f7);
                  border-radius: 8px;
                  padding: 20px;
                  border: 2px solid transparent;
                  background-clip: padding-box;
                  position: relative;
                }

                .bg-gray-200::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(135deg, rgba(255, 0, 150, 0.5), rgba(0, 204, 255, 0.5));
                  z-index: -1;
                  border-radius: 8px;
                  opacity: 0.5; /* Adjust opacity for a subtle effect */
                }

                .shadow-lg {
                  box - shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .hover\:scale-105:hover {
                  transform: scale(1.05);
                }

                .hover\:shadow-xl:hover {
                  box - shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }`}
              </style>
            </div>
          </div>

          {/* Weekly Sales Report section ends */}

        </div>

        {/* Daily Order Summary section ends */}

      </div>
    </div>
  );
};

export default AdminDashboard;