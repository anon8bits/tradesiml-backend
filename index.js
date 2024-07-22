import connectDB from './database.js';
import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import allowedOrigins from './corsConfig.js';
import fs from 'fs';
import https from 'https';
import routes from './routes/routes.js';
import cron from 'node-cron'
import startStockDataCron from './routes/FetchStocks.js';
import updateOpenOrders from './orderUpdate.js';

dotenv.config({ path: '../.env' });
connectDB();

const app = express();
const port = process.env.BACK_PORT;

app.use(json());

const options = {
  key: fs.readFileSync('C:/Users/Anonymous/.vscode/React/tradesiml/backend/SSL Certificate/server.key'),
  cert: fs.readFileSync('C:/Users/Anonymous/.vscode/React/tradesiml/backend/SSL Certificate/server.cert')
};

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

// Dynamically use all routes
Object.entries(routes).forEach(([path, router]) => {
  app.use(path, router);
});

startStockDataCron();

const isMarketOpen = () => {
  const getKolkataTime = () => {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const [{ value: weekday }, , , , { value: hour }, , { value: minute }] =
      new Intl.DateTimeFormat('en-US', { ...options, weekday: 'long', hour: 'numeric', minute: 'numeric' })
        .formatToParts(now);

    return {
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(weekday),
      hour: parseInt(hour),
      minute: parseInt(minute)
    };
  };

  const { dayOfWeek, hour, minute } = getKolkataTime();

  // Check if it's a weekday (Monday to Friday)
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // Convert current time to minutes since midnight
    const currentTimeInMinutes = hour * 60 + minute;

    // Market open time: 9:15 AM (555 minutes)
    const marketOpenTime = 9 * 60 + 15;

    // Market close time: 3:30 PM (930 minutes)
    const marketCloseTime = 15 * 60 + 30;

    // Check if current time is within market hours
    return currentTimeInMinutes >= marketOpenTime && currentTimeInMinutes < marketCloseTime;
  }

  return false;
};
cron.schedule('*/5 * * * *', async () => {
  if (isMarketOpen()) {
    try {
      await updateOpenOrders();
    } catch (error) {
      console.error('Error updating open orders:', error);
    }
  }
});

https.createServer(options, app).listen(port, '0.0.0.0', () => {
  console.log(`App listening on https://localhost:${port}`);
});