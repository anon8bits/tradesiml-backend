import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        default: 'User'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 1000000
    },
    netPL: {
        type: Number,
        required: true,
        default: 0
    },
    unrealizedPL: {
        type: Number,
        required: true,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const User = model('user', userSchema);

export default User;
