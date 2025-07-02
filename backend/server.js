require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const videoRoutes = require('./routes/videoRoutes');


const app = express();

connectDB();


const allowedOrigins = [
    'http://localhost:5173',       
    'http://127.0.0.1:5173',     
    'https://ai-quiz-generator-project-inub71ssd-chandan-dhingras-projects.vercel.app',  
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api', quizRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api', videoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));