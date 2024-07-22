import mongoose, { model } from 'mongoose';
const Schema = mongoose.Schema;

const stockSchema = new Schema({
    ISIN: { type: String, required: true, unique: true },
    Symbol: { type: String, required: true, unique: false },
    Index: { type: [String], required: true },
    DateTime: { type: Date },
    TotalVolume: { type: Number },
    NetChange: { type: Number },
    LTP: { type: Number, required: true },
    Volume: { type: Number },
    High: { type: Number },
    Low: { type: Number },
    Open: { type: Number },
    PClose: { type: Number },
    Name: { type: String, required: true },
    Week52High: { type: Number },
    Week52Low: { type: Number },
    Year5High: { type: Number },
    Month1High: { type: Number },
    Month3High: { type: Number },
    Month6High: { type: Number },
    PercentChange: { type: Number, required: true }
});

stockSchema.index({ ISIN: 1 }, { unique: true });

const Stock = model('Stock', stockSchema);
export default Stock;
