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

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

Object.entries(routes).forEach(([path, router]) => {
  app.use(path, router);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
