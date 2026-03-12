import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import usersRouter from "./routes/usersRoutes.js";
import categoriesRouter from "./routes/categoriesRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { httpStatusText } from "./utils/httpStatusText.js";
import cookieParser from "cookie-parser";
import ordersRouter from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://medohaytham.github.io"
];

const url = process.env.MONGO_URL;
mongoose.connect(url).then(()=>{
  console.log('connected to mongodb');
}).catch((err)=>{
  console.log(err);
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// global middleware for not found routes
app.all(/(.*)/,(req, res, next) => {
  res.status(404).json({status: httpStatusText.ERROR, message: 'this resource is not available'});  
});

// global middleware for error handling
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({status: err.statusText || httpStatusText.ERROR, message: err.message, data: err.data});
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});