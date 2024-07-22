import { OpenOrder, ClosedOrder, Stock, User } from './models/models.js';

function calculatePL(order, currentPrice) {
    const diff = currentPrice - order.entryPrice;
    return order.type === 'Buy' ? diff * order.orderQuantity : -diff * order.orderQuantity;
}

async function updateOpenOrders() {
    const openOrders = await OpenOrder.find({});

    for (const order of openOrders) {
        const stock = await Stock.findOne({ Symbol: order.stockName }).sort({ DateTime: -1 });

        if (!stock) {
            console.log(`Stock ${order.stockName} not found`);
            continue;
        }

        const user = await User.findOne({ email: order.userEmail });

        if (!user) {
            console.log(`User ${order.userEmail} not found`);
            continue;
        }

        const PL = calculatePL(order, stock.LTP);

        // Check if the order should be triggered
        if (!order.triggered && ((order.type === 'Buy' && stock.LTP <= order.entryPrice) ||
            (order.type === 'Sell' && stock.LTP >= order.entryPrice))) {

            // Check user balance for Buy orders
            if (order.type === 'Buy') {
                const orderAmount = order.entryPrice * order.orderQuantity;
                if (user.balance < orderAmount) {
                    console.log(`Insufficient balance for user ${user.email}`);
                    continue;
                }
                user.balance -= orderAmount;
                await user.save();
            }

            // Trigger the order
            order.triggered = true;
            order.PL = PL;
            await order.save();
        }

        // Check if the order should be closed (target price or stop loss hit)
        if (order.triggered) {
            let closeReason = '';
            if (order.type === 'Buy') {
                if (stock.LTP >= order.targetPrice) {
                    closeReason = 'Target Reached';
                } else if (stock.LTP <= order.stopLoss) {
                    closeReason = 'Stop Loss Hit';
                }
            } else if (order.type === 'Sell') {
                if (stock.LTP <= order.targetPrice) {
                    closeReason = 'Target Reached';
                } else if (order.stopLoss !== 0 && stock.LTP >= order.stopLoss) {
                    closeReason = 'Stop Loss Hit';
                }
            }

            if (closeReason) {
                // Create closed order entry
                const closedOrder = new ClosedOrder({
                    userEmail: order.userEmail,
                    type: order.type,
                    stockName: order.stockName,
                    entryPrice: order.entryPrice,
                    tradePrice: stock.LTP,
                    orderQuantity: order.orderQuantity,
                    targetPrice: order.targetPrice,
                    stopLoss: order.stopLoss,
                    status: closeReason,
                    PL: PL,
                    OrderStartTime: order.OrderStartTime,
                    OrderCloseTime: new Date()
                });

                await closedOrder.save();

                // Update user balance for Sell orders
                const finalAmount = stock.LTP * order.orderQuantity;
                user.balance += finalAmount;
                user.netPL += PL;

                await user.save();

                // Delete the open order
                await OpenOrder.deleteOne({ _id: order._id });
            }
        }
    }
}


export default updateOpenOrders;