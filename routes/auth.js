const express = require('express')
const router = express.Router()
var cookieParser = require('cookie-parser')
router.use(cookieParser())
const jwt = require('jsonwebtoken');
require('dotenv').config()
const multer = require('multer');
// SET STORAGE
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/uploads');
    },
    //them phan mo rong
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 4 * 1024 * 1024,
    } 
});

const { validationResult } = require('express-validator')
const loginValidator = require('./validators/loginValidator')
const registerValidator = require('./validators/registerValidator')

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
    // const msg = req.flash('msg') || ''
    // const password = req.flash('password') || ''
    // const username = req.flash('username') || ''
    res.render('login')
})


//login
router.post('/login',loginValidator, async (req, res) => {
    let result = validationResult(req)
    // console.log(result);
    if (result.errors.length === 0){
        let {username, password} = req.body
        let isCount = await Users.findOne({username: username})
        Users.findOne({ username: username }, (err, user) => {
            if (err) {
                return console.log(err)
            }
            if (!user) {
                return res.json({ success: false, msg: 'Sai tài khoản hoặc mật khẩu' })
            }
            //kiểm tra nếu count = 10 thì là đang khoá tạm thời
            if (user.countFailed == 10) {
                return res.json({ success: false, msg: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút' })
            }
            //kiểm tra nếu count = 10 thì là đang khoá tạm thời
            if (user.countFailed == 6) {
                return res.json({ success: false, msg: 'Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản' })
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
                    res.cookie("isCount", isCount.roles)
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
                    return res.json({ success: false, msg: 'Tài khoản đã bị khoá trong 1 phút! Nếu bạn tiếp tục nhập sai thêm 3 lần nữa sẽ bị khoá vĩnh viễn!' })
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
    }else {
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        return res.json({success: false, msg: message})
    }
})

router.get('/register', (req, res) => {
    let error = req.flash('error') || ''
    let phone =  req.flash('phone') || ''
    let fullname = req.flash('fullname') || ''
    let address = req.flash('address') || ''
    let birthday = req.flash('birthday') || ''
    let email = req.flash('email') || ''
    let msgSuccess = req.flash('msgSuccess') || ''
    res.render('register', {error, phone, fullname, address, birthday, email, msgSuccess})
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
router.post('/register', upload.fields([{name: 'cmndfront'}, {name: 'cmndback'}]), registerValidator, async (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0){
        let phone = req.body.phone
        let email = req.body.email
        let cmndfront = req.files.cmndfront[0].originalname
        let cmndback = req.files.cmndback[0].originalname
        let a = req.file
        let fullname = req.body.fullname
        let address =req.body.address
        let birthday=  req.body.birthday
        console.log(a);
        // console.log({phone, email, fullname, address, birthday, cmndfront, cmndback});
    
        Users.findOne({ $or: [{ email: email }, { phone: phone }]})
        .then(data => {
            req.flash('error', 'Email hoặc số điện thoại đã tồn tại')
        }).catch(err => {
            // console.log(err)
            req.flash('error', 'Email hoặc số điện thoại không hợp lệ')
        })
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
                phone: phone,
                email: email,
                fullname: fullname,
                address: address,
                birthday: birthday,
                cmndfront: cmndfront,
                cmndback: cmndback,
                countlogin: 0,
                countFailed: 0,
                money: 0,
                status: 'waitConfirm'
            })
            user.save((error, userResult) => {
                if (error) {
                    req.flash('error', 'Đăng ký that bai')
                    return res.redirect('/auth/register')
                }
    
                //send username and password to user
                const transporter = nodemailer.createTransport({
    
                    host: 'mail.phongdaotao.com',
                    port: 25,
                    auth: {
                        user: 'sinhvien@phongdaotao.com',
                        pass: 'svtdtu'
                    },
                    tls: {
                        rejectUnauthorized: false
                    },
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
    
                var mailOptions = {
                    from: process.env.GMAIL,
                    to: req.body.email,
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
                req.flash('msgSuccess', 'Đăng ký thành công')
                return res.redirect('/auth/login')
            });
        });
    }else {
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        const {email, phone, fullname, address, birthday} = req.body
        req.flash('error', message)
        req.flash('phone', phone)
        req.flash('fullname', fullname)
        req.flash('address', address)
        req.flash('birthday', birthday)
        req.flash('email', email);
        res.redirect('/auth/register')
    }
    //Tạo username ngẫu nhiên
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