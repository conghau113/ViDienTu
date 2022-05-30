const { check } = require('express-validator')

module.exports = [
    check('email')
    .exists().withMessage('Vui lòng cung cấp địa chỉ email')
    .notEmpty().withMessage('Địa chỉ email không được để trống')
    .isEmail().withMessage('Địa chỉ email không hợp lệ'),

    check('password')
    .exists().withMessage('Vui lòng cung cấp mật khẩu')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({min: 6}).withMessage('Mất khẩu phải có ít nhất 6 ký tự')
    .isLength({max: 30}).withMessage('Mất khẩu không được quá 30 kí tự'),

    check('fullname')
    .exists().withMessage('Vui lòng cung cấp tên người dùng')
    .notEmpty().withMessage('Tên người dùng không được để trống')
    .isLength({min: 6}).withMessage('Tên người dùng phải có ít nhất 6 ký tự')

]