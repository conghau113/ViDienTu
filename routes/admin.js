const express = require('express')
const router = express.Router()
var cookieParser = require('cookie-parser')
router.use(cookieParser())

//model
const Users = require('../models/user')
const History = require('../models/history')
// function isAdmin(req, res, next){
//     if(!req.cookies.isCount){
//         res.redirect('/auth/login')
//     }
//     if(req.cookies.isCount === 'admin'){
//         next()
//     }
//     res.redirect('/admin')
// }
router.get('/taikhoanchuakichhoat',  (req, res) => {
    res.render('admin_TK_ChuaKichHoat')
})

router.get('/taikhoandakichhoat', (req, res) => {
    res.render('admin_TK_DaKichHoat')
})

router.get('/taikhoandangbikhoa', (req, res) => {
    res.render('admin_TK_DangBiKhoa')
})

router.get('/taikhoanvohieuhoa', (req, res) => {
    res.render('admin_TK_VoHieuHoa')
})

router.get('/taikhoanxemchitiet', (req, res) => {
    res.render('admin_TK_XemChitiet')
})

module.exports = router