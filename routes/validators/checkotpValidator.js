const { check } = require('express-validator')

module.exports = [
    check('otp').exists().withMessage('Vui lòng nhập mã OTP')
    .notEmpty().withMessage('Mã OTP không được để trống')
]