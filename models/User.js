const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    dni_user: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: String,
        required: false,
        default: "No age"
    },
    phone: {
        type: String,
        required: false,
        default: "No phone"
    }
});


const User = mongoose.model('User', UserSchema);

module.exports = User;