require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');


const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5173', // Update this to match your frontend URL
    credentials: true
  }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', quizRoutes);
app.use('/api/quiz', quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));