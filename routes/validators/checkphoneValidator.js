const { check } = require('express-validator')

module.exports = [
    check('phone').exists().withMessage('Vui lòng nhập số điện thoại')
    .notEmpty().withMessage('Số điện thoại không được để trống'),
]