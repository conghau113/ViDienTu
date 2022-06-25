const { check } = require('express-validator')

module.exports = [
    check('maSoThe').exists().withMessage('Vui lòng nhập mã số thẻ')
    .notEmpty().withMessage('Mã số thẻ không được để trống'),

    check('ngayHH').exists().withMessage('Vui lòng nhập ngày hết hạn')
    .notEmpty().withMessage('Ngày hết hạn không được để trống'),

    check('maCVV').exists().withMessage('Vui lòng nhập mã CVV')
    .notEmpty().withMessage('Mã CVV không được để trống'),

    check('inpMoney').exists().withMessage('Vui lòng nhập số tiền')
    .notEmpty().withMessage('Số tiền không được để trống'),


]