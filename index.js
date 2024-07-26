import connectDB from './database.js';
import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import allowedOrigins from './corsConfig.js';
import routes from './routes/routes.js';

dotenv.config({ path: './.env' });
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(json());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

Object.entries(routes).forEach(([path, router]) => {
  app.use(path, router);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});