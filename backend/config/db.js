const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB URI with your password inserted
    const conn = await mongoose.connect('mongodb+srv://collin3738:reset123@cluster0.g3qbkf4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
