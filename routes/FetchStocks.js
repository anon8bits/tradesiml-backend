import axios from 'axios';
import Stock from '../models/Stocks.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config({ path: '../.env' });

const indicies = [
    'NIFTY', 'BANKNIFTY', 'NIFTYOIL', 'NIFTYPVTBANK', 'NIFTYM50', 'NSEQ30'
];

const fetchAndUpdateStockData = async (index) => {
    try {
        const response = await axios.get(`${process.env.RAPID_API_URL}`, {
            params: {
                Indicies: index
            },
            headers: {
                'x-rapidapi-key': `${process.env.RAPID_API_KEY}`,
                'x-rapidapi-host': `${process.env.RAPID_API_HOST}`
            }
        });
        const stocksData = response.data;

        for (const stock of stocksData) {
            if (!stock.ISIN || typeof stock.ISIN !== 'string') continue;
            const filter = { ISIN: stock.ISIN };
            const update = {
                Symbol: stock.Symbol,
                DateTime: new Date(stock['Date/Time']),
                TotalVolume: stock['Total Volume'],
                NetChange: stock['Net Change'],
                LTP: stock.LTP,
                Volume: stock.Volume,
                High: stock.High,
                Low: stock.Low,
                Open: stock.Open,
                PClose: stock['P Close'],
                Name: stock.Name,
                Week52High: stock['52Wk High'],
                Week52Low: stock['52Wk Low'],
                Year5High: stock['5Year High'],
                ISIN: stock.ISIN,
                Month1High: stock['1M High'],
                Month3High: stock['3M High'],
                Month6High: stock['6M High'],
                PercentChange: stock['%Chng'],
                $addToSet: { Index: index }
            };

            await Stock.findOneAndUpdate(filter, update, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true
            });
        }

    } catch (error) {
        console.error(`Error updating stock data for ${index}:`, error);
    }
};

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchAndUpdateAllStockData = async () => {
    for (const index of indicies) {
        await fetchAndUpdateStockData(index);
        await delay(1000);
    }
};

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

const startStockDataCron = () => {
    // Schedule the cron job to run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        if (isMarketOpen()) {
            try {
                await fetchAndUpdateAllStockData();
                console.log('Stock data updated successfully');
            } catch (error) {
                console.error('Error updating stock data:', error);
            }
        }
    });
};

export default startStockDataCron;