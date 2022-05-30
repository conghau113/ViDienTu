const { check } = require('express-validator')

module.exports = [
    check('username')
    .exists().withMessage('Vui lòng nhập tên người dùng')
    .notEmpty().withMessage('Tên người dùng không được để trống'),

    check('password')
    .exists().withMessage('Vui lòng cung cấp mật khẩu')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({min: 6}).withMessage('Mất khẩu phải có ít nhất 6 ký tự')
    .isLength({max: 30}).withMessage('Mất khẩu không được quá 30 kí tự')
]