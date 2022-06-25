const { check } = require('express-validator')

module.exports = [
    check('username').exists().withMessage('Vui lòng nhập username')
    .notEmpty().withMessage('Username không được để trống')
    .custom(value => !/\s/.test(value)).withMessage('Username không được có khoảng trắng'),
    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải từ 6 kí tự trở lên'),
]