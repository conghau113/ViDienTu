const mongoose = require('mongoose')

const transactionHistory = new mongoose.Schema({
    username:{
        type: String
    },
    // nạp tiền: 1, rút tiền: 2, chuyển tiền: 3, nhận tiền: 4, mua thẻ điện thoại: 5
    typeTransaction: {
        type: Number
    },
    money: {
        type: Number
    },
    dateTime:{
        type:Date , default: Date.now
    },
    // Thành công: 1, chờ duyệt: 2, hủy: 3
    statusTransaction: {
        type: Number
    },
    note:{
        type: String, default: ""
    },
    // ma the cao
    telecom:String,
    value: String,
    code: Array,
    receiver: String,
    phoneReceiver: String,
    fee:{
        type: Number, default: 0
    }
})

module.exports = mongoose.model('transactionHistory', transactionHistory)