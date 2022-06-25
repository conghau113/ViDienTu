const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
require('dotenv').config()
//khai báo view, public,...
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.resolve('./public')))

app.use(cookieParser('ewalletproject'))
app.use(session({cookie: {maxAge: 60000}}));
app.use(flash());

//ket noi database
const mongoose = require('mongoose');
const DBPATH = 'mongodb://localhost:27017/vidientu'
mongoose.connect(DBPATH);

//các route
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/admin', require('./routes/admin'))

//run server
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { render } = require('express/lib/response')
const io = new Server(server);
const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`http://localhost:${PORT}`))