const express = require('express')
const router = express.Router()
var cookieParser = require('cookie-parser')
router.use(cookieParser())
const jwt = require('jsonwebtoken');
require('dotenv').config()

//model
const Users = require('../models/user')

const bcrypt = require('bcrypt');
const saltRounds = 10;


//tao tai khoan admin
// bcrypt.hash('123456', saltRounds, function (err, hash) {
//     const user = new Users({
//         roles: 'admin',
//         username: 'admin',
//         password: hash,
//     })
//     user.save((error, userResult) => {
//         if (error) {
//             console.log(error)
//         }
//     });
// });

router.get('/login', (req, res) => {
    res.render('login')
})


//login
router.post('/login', (req, res) => {
    let username = req.body.username
    let password = req.body.password

    Users.findOne({ username: username }, (err, user) => {
        if (err) {
            return console.log(err)
        }
        if (!user) {
            return res.json({ success: false, msg: `Sai tài khoản hoặc mật khẩu` })
        }
        //kiểm tra nếu count = 10 thì là đang khoá tạm thời
        if (user.countFailed == 10) {
            return res.json({ success: false, msg: `Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút` })
        }
        //kiểm tra nếu count = 10 thì là đang khoá tạm thời
        if (user.countFailed == 6) {
            return res.json({ success: false, msg: `Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản` })
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
                var token = jwt.sign({ _id: user._id }, 'secretpasstoken', { expiresIn: '30m' })
                Users.updateOne({ username: username }, { $set: { countFailed: 0 } }, (err, status) => {
                    if (err) {
                        console.log(err)
                    }
                })
                res.cookie("username", username)
                return res.json({ success: true, token: token, msg: 'Đăng nhập thành công!' })
            }
            const failed = user.countFailed
            if (failed == 2) {
                //Khoá tạm thời set count = 10
                Users.updateOne({ username: username }, { $set: { countFailed: 10 } }, (err, status) => {
                    if (err) {
                        console.log(err)
                    }
                })

                //Mở khoá tài khoản sau 1 phút, trả count về 3
                var lockAccountOneMinute = setTimeout(function () {
                    Users.updateOne({ username: username }, { $set: { countFailed: 3 } }, (err, status) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                    console.log(`unlock ${username} !`)
                }, 60000);
                return res.json({ success: false, msg: `Tài khoản đã bị khoá trong 1 phút! Nếu bạn tiếp tục nhập sai thêm 3 lần nữa sẽ bị khoá vĩnh viễn!` })
            } else if (failed >= 5) {
                Users.updateOne({ username: username }, { $set: { countFailed: 6 } }, (err, status) => {
                    if (err) {
                        console.log(err)
                    }
                })
                return res.json({ success: false, msg: 'Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản' })
            } else {
                Users.updateOne({ username: username }, { $set: { countFailed: failed + 1 } }, (err, status) => {
                    if (err) {
                        console.log(err)
                    }
                })
                return res.json({ success: false, msg: `Bạn đã nhập sai mật khẩu ${failed + 1} lần!!!` })
            }
        });
    })
})

router.get('/register', (req, res) => {
    res.render('register')
})

function checkUserExist(username) {
    Users.findOne({ username: username }).then(data => {
        return true
    }).catch(err => {
        console.log(err)
    })
    return false
}

function makePassword() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const nodemailer = require('nodemailer');
const { get } = require('express/lib/response');
router.post('/register', (req, res) => {
    //Tạo username ngẫu nhiên
    const phone = req.body.user.phone
    const email = req.body.user.email
    // Users.findOne({ $or: [{ email: email }, { phone: phone }]})
    // .then(data => {
    //     return res.json({ msg: 'Email hoặc số điện thoại đã tồn tại!', success: false })
    // }).catch(err => {
    //     console.log(err)
    // })
    let username = Math.random() * (9999999999 - 1000000000) + 1000000000;
    while (checkUserExist(username)) {
        username = Math.random() * (9999999999 - 1000000000) + 1000000000;
    }
    username = parseInt(username)
    //Tạo password ngẫu nhiên
    let temp = makePassword()
    bcrypt.hash(temp, saltRounds, function (err, hash) {
        const user = new Users({
            roles: 'user',
            username: username,
            password: hash,
            phone: req.body.user.phone,
            email: req.body.user.email,
            fullname: req.body.user.fullname,
            address: req.body.user.address,
            birthday: req.body.user.birthday,
            cmndfront: req.body.user.cmndfront,
            cmndback: req.body.user.cmndback,
            countlogin: 0,
            countFailed: 0,
            money: 0,
            status: 'waitConfirm'
        })
        user.save((error, userResult) => {
            if (error) {
                console.log(error)
                return res.json({ msg: 'Đăng ký thất bai', success: false })
            }

            //send username and password to user
            // const transporter = nodemailer.createTransport({

            //     host: 'mail.phongdaotao.com',
            //     port: 25,
            //     auth: {
            //         user: 'sinhvien@phongdaotao.com',
            //         pass: 'svtdtu'
            //     },
            //     tls: {
            //         rejectUnauthorized: false
            //     },
            //     ssl: {
            //         rejectUnauthorized: false
            //     }
            // });
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "conghau1132000@gmail.com", // generated ethereal user
                  pass: "anhnhoemnhiulam", // generated ethereal password
                },
              });

            var mailOptions = {
                // from: process.env.GMAIL,
                from: "conghau1132000@gmail.com",
                to: req.body.user.email,
                subject: 'ĐĂNG KÝ THÀNH CÔNG',
                text: `Your account information:
                    username: ${username}
                    password: ${temp}
                `
            };
            transporter.verify(function(error, success) {
                // Nếu có lỗi.
                if (error) {
                    console.log(error);
                } else { //Nếu thành công.
                    console.log('Kết nối thành công!');
                }
            });

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);

                }
            });
            return res.json({ success: true, msg: 'Đăng ký thành công' })
        });
    });
})

router.post('/logout', (req, res) => {
    req.session = null
    res.json({ logout: true })
})

router.post('/changePassword', (req, res) => {
    const newPassword = req.body.password
    const username = req.body.username
    bcrypt.hash(newPassword, saltRounds, function (error, hash) {
        if (error) {
            return res.json({ username: username, success: false, msg: 'Đổi mật khẩu thất bại' })
        }
        Users.updateOne({ username: username }, { $set: { password: hash, countlogin: 1 } }, (err, status) => {
            if (err) {
                console.log(err)
                return res.json({ username: username, success: false, msg: 'Đổi mật khẩu thất bại' })
            }
            return res.json({ username: username, success: true, msg: 'Đổi mật khẩu thành công' })
        })
    });


})
module.exports = router