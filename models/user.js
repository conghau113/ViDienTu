const mongoose = require('mongoose')

const User = new mongoose.Schema({
    roles: {
        type: String,
    },
    username: {
        type: String,
    },
    password: {
        type: String
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    birthday: {
        type: String,
    },
    address: {
        type: String,
    },
    cmndfront: {
        type: String,
    },
    cmndback: {
        type: String,
    },
    fullname: {
        type: String,
    },
    countlogin: {
        type: String,
    },
    status: {
        type: String,
    },
    //1. waitConfirm 2. confirmed 3.waitUpdate 4. bannedMany
    countFailed: {
        type: Number,
    },
    money: {
        type: Number
    }

})

module.exports = mongoose.model('User', User)