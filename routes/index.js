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
const { validationResult } = require('express-validator')
var secret = 'secretpasstoken'

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

router.get('/', isLoggined, (req, res) => {
    res.render('index')
})

router.get('/naptien', isLoggined, (req, res) => {
    res.render('naptien')
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

async function rutTien(username, money, status){
    if (status === 1){
        let a = await Users.findOneAndUpdate(
            {username:username}
            , {
                $inc: {money: -money}
            })
            if (a){
                let history = new History({username: username, typeTransaction: 2, money: money, statusTransaction: status})
                return history.save()
            }else{
                return res.json({ msg: `Rút tiền thất bại`, success: false })
            }
    }else 
    if(status === 2){
        let history = new History({username: username, typeTransaction: 2, money: money, statusTransaction: status})
        return history.save()
    }
}

router.post('/naptien',isLoggined, async (req, res) => {
    let {maSoThe, ngayHH, maCVV, inpMoney} = req.body
    let username = req.cookies.username;
    // console.log({maSoThe, ngayHH, maCVV, inpMoney});
    if(maSoThe === '111111'){
        if(ngayHH === "10/10/2022"){
            if(maCVV === "411"){
                napTien(username, inpMoney)
                console.log("Nạp thành công", inpMoney);
            }else{
                console.log("Thông tin không hợp lệ");
            }
        }else{
            console.log("Thông tin không hợp lệ");
        }
    }else if(maSoThe === '222222'){
        if(ngayHH === "11/11/2022"){
            if(maCVV === "443"){
                if(inpMoney <= 1000000){
                    napTien(username, inpMoney)
                    console.log("Nạp thành công", inpMoney);
                }else{
                    console.log("Chỉ được nạp tối đa là 1 triệu");
                }
            }else{
                console.log("Thông tin không hợp lệ");
            }
        }else{
            console.log("Thông tin không hợp lệ");
        }
    }else if(maSoThe === '333333'){
        if(ngayHH === "12/12/2022"){
            if(maCVV === "577"){
                console.log("Thẻ hết tiền");
            }else{
                console.log("Thông tin không hợp lệ");
            }
        }else{
            console.log("Thông tin không hợp lệ");
        }
    }else{
        console.log("Thông tin không hợp lệ");
    }
})

router.get('/ruttien', isLoggined, (req, res) => {
    res.render('ruttien')
})

router.post('/ruttien', isLoggined, async (req, res) => {
    let username = req.cookies.username
    let {maSoThe, ngayHH, maCVV, inpMoney, ghiChuRutTien} = req.body
    // console.log({maSoThe, ngayHH, maCVV, inpMoney, ghiChuRutTien});
    let sodu = Number(inpMoney) + inpMoney*0.05
    // let getMoney = await Users.findOne({username:username})
    // let currentMoney = getMoney.money
    if(maSoThe === '111111'){
        if(ngayHH === "10/10/2022"){
            if(maCVV === "411"){
                if(inpMoney % 50000 === 0 && inpMoney < 5000000 && inpMoney >=0 ){
                    let status = 1
                    // console.log("Rut tien thanh cong", sodu);
                    rutTien(username, sodu, status)
                    return res.json({ msg: `Rút tiền thành công`, success: true })
                    // if(sodu < currentMoney){
                    //     rutTien(username, sodu, status)
                    //     return res.json({ msg: `Rút tiền thành công`, success: true })
                    // }else{
                    //     return res.json({ msg: `Tài khoản không đủ tiền`, success: false })
                    // }
                }else if(inpMoney % 50000 === 0 && inpMoney > 5000000){
                    // console.log("cho duyet : ", inpMoney);
                    let status = 2
                    rutTien(username, sodu, status)
                    return res.json({ msg: `Chờ duyệt`, success: false })
                }else{
                    return res.json({ msg: `Rút tiền thất bại`, success: false })
                    // console.log("Rút tiền that bai", inpMoney);
                }
            }else{
                // console.log("Thông tin không hợp lệ");
                return res.json({ msg: `Thông tin không hợp lệ`, success: false })
            }
        }
        else{
            // console.log("Thông tin không hợp lệ");
            return res.json({ msg: `Thông tin không hợp lệ`, success: false })
        }
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

router.get('/profile',isLoggined, (req, res) => {
    res.render('profile')
})

module.exports = router
