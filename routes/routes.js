import orderRoute from './PlaceOrder.js';
import userDetails from './UserDetails.js';
import stockRoute from './GetStocks.js';
import StockDetailRoute from './GetStockDetails.js';
import FetchOpenOrders from './FetchOpenOrders.js';
import FetchClosedOrders from './FetchClosedOrders.js';
import OpenOrderDetails from './openOrderDetails.js';
import ClosedOrderDetails from './closedOrderDetails.js';
import CancelOrder from './cancelOrder.js';
import ExecuteNow from './ExecuteNow.js';
import Test from './Test.js';
import AddMoney from './addMoney.js'

export default {
    '/api/order': orderRoute,
    '/api/stocks': stockRoute,
    '/api/stockDetail': StockDetailRoute,
    '/api/fetchOpenOrders': FetchOpenOrders,
    '/api/fetchClosedOrders': FetchClosedOrders,
    '/api/getUser': userDetails,
    '/api/open': OpenOrderDetails,
    '/api/closed': ClosedOrderDetails,
    '/api/cancelOrder': CancelOrder,
    '/api/executenow': ExecuteNow,
    '/api/test': Test,
    '/api/addMoney' : AddMoney
};