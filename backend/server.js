import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import betRoutes from './routes/bets.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', //allow frontend to connect to backend
    credentials: true, // credentials (cookies, authorization headers, etc)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'] // allowed headers
}));

app.use(express.json());

// add session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// connect to MongoDB using Mongoose
connectDB();

app.use('/api', authRoutes);
app.use('/api', betRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
