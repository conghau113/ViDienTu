const express = require('express')
const router = express.Router()
var cookieParser = require('cookie-parser')
router.use(cookieParser())

//model
const Users = require('../models/user')
const History = require('../models/history')

//auth

const jwt = require('jsonwebtoken');
const { Cookies } = require('nodemailer/lib/fetch')
const res = require('express/lib/response')
const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator')
const loginValidation = require('./validators/loginValidator')
const registerValidation = require('./validators/registerValidator')
const naptienValidation = require('./validators/naptienValidator')
const ruttienVlidation = require('./validators/ruttienValidator')
const chuyentienValidation = require('./validators/chuyentienValidator')
const checkphoneValidation = require('./validators/checkphoneValidator')
const checkotpValidation = require('./validators/checkotpValidator')
var secret = 'secretpasstoken'

// function isUser(req, res, next){
//     if(!req.cookies.isCount){
//         return  res.redirect('/auth/login')
//     }
//     if(req.cookies.isCount === 'user'){
//         next()
//     }else{

//         return res.redirect('/')
//     }
    
// }
function isLoggined(req, res, next) {
    try {
        var token = req.cookies.token;
        var decodeToken = jwt.verify(token, secret)
        Users.findOne({
            _id: decodeToken
        }).then(data => {
            if (data) {
                req.data = data
                if (data.countlogin === '0') {
                    return res.render('firstLogin', { username: data.username })
                }
                next()
            }
        }).catch(err => {
            console.log(err)
        })
    } catch (error) {
        return res.redirect('/auth/login')
    }
}

router.get('/', isLoggined, async (req, res) => {
    let username = req.cookies.username
    const history = await History.find({username: username})
    // console.log(history)
    res.render('index', {history})
})

router.get('/naptien', isLoggined, (req, res) => {
    let error = req.flash('error') || ''
    let maSoThe  = req.flash('maSoThe') || ''
    let ngayHH  = req.flash('ngayHH') || ''
    let maCVV = req.flash('maCVV') || ''
    let inpMoney  = req.flash('inpMoney') || ''
    let msgSuccess = req.flash('msgSuccess') || ''
    res.render('naptien', {error, maSoThe, ngayHH, maCVV, inpMoney, msgSuccess})
})
async function napTien(username, money){
    let a = await Users.findOneAndUpdate(
        {username:username}
        , {
            $inc: {money: money}
        })
        if (a){
            let history = new History({username: username, typeTransaction: 1, money: money, statusTransaction: 1})
            return history.save()
        }
}


router.post('/naptien',isLoggined,naptienValidation, async (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0){
        let {maSoThe, ngayHH, maCVV, inpMoney} = req.body
        let username = req.cookies.username;
        // console.log({maSoThe, ngayHH, maCVV, inpMoney});
        if(maSoThe === '111111'){
            if(ngayHH === "10/10/2022"){
                if(maCVV === "411"){
                    napTien(username, inpMoney)
                    req.flash('msgSuccess', 'Nạp tiền thành công')
                    return res.redirect('/naptien')
                }else{
                    req.flash('error', 'Thông tin không hợp lệ')
                    return res.redirect('/naptien')
                }
            }else{
                req.flash('error', 'Thông tin không hợp lệ')
                return res.redirect('/naptien')
            }
        }else if(maSoThe === '222222'){
            if(ngayHH === "11/11/2022"){
                if(maCVV === "443"){
                    if(inpMoney <= 1000000){
                        napTien(username, inpMoney)
                        req.flash('msgSuccess', 'Nạp tiền thành công')
                        return res.redirect('/naptien')
                    }else{
                        req.flash('error', 'Số tiền chỉ được nạp tối đa là 1 triệu')
                        return res.redirect('/naptien')
                    }
                }else{
                    req.flash('error', 'Thông tin không hợp lệ')
                    return res.redirect('/naptien')
                }
            }else{
                req.flash('error', 'Thông tin không hợp lệ')
                return res.redirect('/naptien')
            }
        }else if(maSoThe === '333333'){
            if(ngayHH === "12/12/2022"){
                if(maCVV === "577"){
                    req.flash('error', 'Thẻ hết tiền')
                    return res.redirect('/naptien')
                }else{
                    req.flash('error', 'Thông tin không hợp lệ')
                    return res.redirect('/naptien')
                }
            }else{
                req.flash('error', 'Thông tin không hợp lệ')
                return res.redirect('/naptien')
            }
        }else{
            req.flash('error', 'Thông tin không hợp lệ')
            return res.redirect('/naptien')
        }
    }else{
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        let {maSoThe, ngayHH, maCVV, inpMoney} = req.body
        req.flash('error', message)
        req.flash('maSoThe', maSoThe)
        req.flash('ngayHH', ngayHH)
        req.flash('maCVV', maCVV)
        req.flash('inpMoney', inpMoney)
        // req.flash('inpMoney', msg)
        res.redirect('/naptien')
    }

})

async function rutTien(username, money, status, fee, note){
    if (status === 1){
        let a = await Users.findOneAndUpdate(
            {username:username}
            , {
                $inc: {money: -money}
            })
            if (a){
                let history = new History({username: username, typeTransaction: 2, money: money, statusTransaction: status, fee: fee, note: note})
                return history.save()
            }else{
                return res.json({ msg: `Rút tiền thất bại`, success: false })
            }
    } if(status === 2){
        let history = new History({username: username, typeTransaction: 2, money: money, statusTransaction: status, fee: fee, note: note})
        return history.save()
    }
}

router.get('/ruttien', isLoggined,(req, res) => {
    res.render('ruttien')
})

router.post('/ruttien', isLoggined, ruttienVlidation, async (req, res) => {
    let result = validationResult(req)
    if(result.errors.length === 0){
        let username = req.cookies.username
        let {maSoThe, ngayHH, maCVV, inpMoney, ghiChuRutTien} = req.body
        // console.log({maSoThe, ngayHH, maCVV, inpMoney, ghiChuRutTien});
        const fee = inpMoney*0.05
        let note = ghiChuRutTien
        const sodu = Number(inpMoney) + fee
        let getMoney = await Users.findOne({username:username})
        let currentMoney = getMoney.money
        if(maSoThe === '111111'){
            if(ngayHH === "10/10/2022"){
                if(maCVV === "411"){
                    if(inpMoney % 50000 === 0 && inpMoney < 5000000 && inpMoney >=0 ){
                        if(sodu < currentMoney){
                            rutTien(username, sodu, 1, fee, note)
                            return res.json({ msg: 'Rút tiền thành công', success: true })
                        }else{
                            return res.json({ msg: 'Tài khoản không đủ tiền', success: false })
                        }
                    }else if(inpMoney % 50000 === 0 && inpMoney >= 5000000){
                        // console.log("cho duyet : ", inpMoney);
                        if(sodu < currentMoney){
                            rutTien(username, sodu, 2, fee, note)
                            return res.json({ msg: 'Chờ duyệt', success: true })
                        }else{
                            return res.json({ msg: 'Tài khoản không đủ tiền', success: false })
                        }
                    }else{
                        return res.json({ msg: 'Rút tiền thất bại', success: false })
                        // console.log("Rút tiền that bai", inpMoney);
                    }
                }else{
                    // console.log("Thông tin không hợp lệ");
                    return res.json({ msg: 'Thông tin không hợp lệ', success: false })
                }
            }
            else{
                // console.log("Thông tin không hợp lệ");
                return res.json({ msg: 'Thông tin không hợp lệ', success: false })
            }
        }else if(maSoThe === '333333' || maSoThe === '222222'){
            return res.json({ msg: 'Thẻ này không được hỗ trợ để rút tiền', success: false })
        }else{
            return res.json({ msg: 'Thông tin không hợp lệ', success: false })
        }
    }else{
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        return res.json({success: false, msg: message})
    }

})

router.get('/muacard', isLoggined, async (req, res) => {
    res.render('muacard')
})

router.post('/muacard', isLoggined, async (req, res) => {
    async function muaThe(username, money, telecom, value, code){
        let a = await Users.findOneAndUpdate(
            {username:username}
            , {
                $inc: {money:-money}
            })
            if (a){
                let history = new History({username: username, typeTransaction: 5, money: money, statusTransaction: 1, telecom: telecom, value: value, code:code})
                history.save().then(()=>{
                    return res.render('hoadonmuacard',{history})
                })
            }
    }
    let username = req.cookies.username
    let {nhaMang, menhGia, soLuong} = req.body
    let mathe = [];
    while(mathe.length < soLuong){
        let r = nhaMang + (Math.floor(Math.random()*90000) + 10000).toString();
        mathe.push(r);
    }
    let sodu = soLuong*menhGia
    if(nhaMang === "11111"){
        // console.log(mathe);
        muaThe(username, sodu, nhaMang, menhGia, mathe)
        
    }else if(nhaMang === "22222"){
         muaThe(username, sodu, nhaMang, menhGia, mathe)
        
    }else if(nhaMang === "33333"){
         muaThe(username, sodu, nhaMang, menhGia, mathe)
        
        
    }else{
        
    }
})

router.get('/hoadonmuacard', (req, res) => {
    res.render('hoadonmuacard')
})

router.get('/profile',isLoggined, async (req, res) => {
    let username = req.cookies.username
    const user = await Users.findOne({username: username})
    // console.log(user);
    res.render('profile',{user})
})

async function chuyenTien(username, money, status, fee, note, phone, fullname){
    if (status === 1){
        let a = await Users.findOneAndUpdate(
            {username:username}
            , {
                $inc: {money: -money}
            })
            if (a){
                let history = new History({username: username, typeTransaction: 2, money: money, statusTransaction: status, fee: fee, note: note, phone: phone, fullname: fullname})
                return history.save()
            }else{
                return res.json({ msg: `Chuyển tiền thất bại`, success: false })
            }
    } if(status === 2){
        let history = new History({username: username, typeTransaction: 2, money: money, statusTransaction: status, fee: fee, note: note, phone: phone, fullname: fullname})
        return history.save()
    }
}

router.get('/chuyentien', isLoggined, async (req, res) => {
    let error = req.flash('error') || ''
    res.render('chuyentien', {error})
})
let timeOtpSend
let otp
router.post('/checkotp', isLoggined, chuyentienValidation, async(req, res)=>{
    let result = validationResult(req)
    if(result.errors.length === 0){
        let username = req.cookies.username
        let {phone, fullname, inpMoney,radioChuyenTien,ghiChuChuyenTien} = req.body
        console.log( {phone, fullname, inpMoney,radioChuyenTien,ghiChuChuyenTien});
        const fee = inpMoney*0.05
        let note = ghiChuChuyenTien
        const sodu = Number(inpMoney) + fee
        if(phone !== '' || fullname!=='' || inpMoney!==''){
            otp = Math.floor(100000 + Math.random() * 900000)
            timeOtpSend = new Date().getTime()
            console.log(otp, timeOtpSend);

            let getEmail = await Users.findOne({phone: phone}).distinct('email')
            console.log(getEmail);

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
                to: getEmail,
                subject: 'Mã xác nhận chuyển tiền',
                text: `Mã OTP: ${otp}`
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
            res.json({success: true})
        }else{
            res.json({success: false, msg: 'Thông tin không được để trống'})
        }


    }else{
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        return res.json({success: false, msg: message})
    }
})

let timeOtp
router.post('/chuyentien', isLoggined, checkotpValidation, async(req, res)=>{
    let result = validationResult(req)
    console.log(result);
    if(result.errors.length === 0){
        let otpInput = req.body.otp
        console.log(otp);
        console.log(otpInput);
        timeOtp = new Date().getTime()
        console.log(timeOtp);
        console.log(otp);
        let time = (timeOtp - timeOtpSend)/1000
        if(time <=60 && otpInput == otp){
            let sender = req.cookies.username
            let receiver = req.body.phone
            let note = req.body.ghiChuChuyenTien
            console.log(sender);
            let senderMoney = await Users.find({username: sender}).distinct('money')
            console.log("a",senderMoney);

            // let receiverMoney = await Users.find({phone: receiver}).distinct('money')
            let receiverUsername = await Users.find({phone: receiver}).distinct('username')[0]
            // console.log({senderMoney, receiverMoney})
            let radioChuyenTien = req.body.radioChuyenTien
            // console.log(radioChuyenTien)
            let inpMoney = Number(req.body.inpMoney)
            let fee = Number(inpMoney*0.05)
            let money =Number(inpMoney + fee) 
            let feeReceiver =Number(inpMoney-fee) 
            console.log(senderMoney, money);
            if(senderMoney >=money){
                if(inpMoney <= 5000000){
                    if(radioChuyenTien === 'nguoiChuyenTra'){
                        let updatMoneySender =  await Users.findOneAndUpdate({username: sender}, {$inc: {money: -money}})
                        let updatMoneyReceiver = await Users.findOneAndUpdate({phone: receiver},{$inc: {money: inpMoney}})
                        let historySender = new History({username: sender, typeTransaction: 3, money: inpMoney, statusTransaction: 1, fee: fee, note: note})
                        historySender.save()
                        let historyReceiver = new History({username: receiverUsername, typeTransaction: 4, money: inpMoney, statusTransaction: 1, note: note})
                        historyReceiver.save()
                        return res.json({success: true, msg: "Chuyển tiền thành công"})
                    }else{
                        let updatMoneySender =  await Users.findOneAndUpdate({username: sender}, {$inc: {money: -inpMoney}})
                        let updatMoneyReceiver = await Users.findOneAndUpdate({phone: receiver},{$inc: {money: feeReceiver}})
                        let historySender = new History({username: sender, typeTransaction: 3, money: inpMoney, statusTransaction: 1, note: note})
                        historySender.save()
                        let historyReceiver = new History({username: receiverUsername, typeTransaction: 4, money: inpMoney, statusTransaction: 1, fee: fee, note: note})
                        historyReceiver.save()
                        return res.json({success: true, msg: "Chuyển tiền thành công"})
                    }
                }else{
                    let historySender = new History({username: sender, typeTransaction: 3, money: inpMoney, statusTransaction: 2, fee: fee, note: note})
                    historySender.save()
                    return res.json({success: true, msg: "Chuyển tiền thành công, chờ admin duyệt đển nhận tiền"})
                    
                }
            }else{
               
                return res.json({success: false, msg:"Tài khoản không đủ tiền để thực hiện chức năng !!!"})
               
            }
            
            

        }else{
            return res.json({success: false, msg:"Mã OTP không đúng hoặc hết hạn"})
          
        }

    }else{
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        return res.json({success: false, msg: message})
    }
})

router.post('/checkPhone', isLoggined, checkphoneValidation, async (req, res) => {
    let result = validationResult(req)
    if(result.errors.length === 0){
        let phone = req.body.phone
        const nguoinhan = await Users.findOne({phone: phone})
        if(nguoinhan){
            if(nguoinhan.phone === phone){
                return res.json({msg: `${nguoinhan.fullname}`, success: true})
            }else{
                return res.json({ msg: 'Số điện thoại không hợp lệ', success: false })
            }
        }else{
            return res.json({ msg: 'Số điện thoại không hợp lệ', success: false })
        }

    }else{
        result = result.mapped()
        let message
        for(fields in result) {
            message = result[fields].msg
            break
        }
        return res.json({success: false, msg: message})
    }
})



module.exports = router
