// const { Result } = require("express-validator");

//------------------REGISTER------------------
// const firebaseConfig = {
//     apiKey: "AIzaSyDxtG9MNBaJdZ6iXmuPLseJsFmmiyYC2cI",
//     authDomain: "e-wallet-14171.firebaseapp.com",
//     projectId: "e-wallet-14171",
//     storageBucket: "e-wallet-14171.appspot.com",
//     messagingSenderId: "142732781217",
//     appId: "1:142732781217:web:029956b84082595c7032e0"
//   };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// function register() {
//     const user = {
//         'phone': $('#phone').val(),
//         'email': $('#email').val(),
//         'fullname': $('#fullname').val(),
//         'address': $('#address').val(),
//         'birthday': $('#birthday').val(),
//         'cmndfront': '',
//         'cmndback': ''
//     }

//     const ref = firebase.storage().ref();
//     //cmnd truoc
//     const cmndfront = document.querySelector("#cmndfront").files[0];
//     const cmndback = document.querySelector("#cmndback").files[0];
    

//     console.log("img",front, back)
//     console.log("file",cmndback,cmndfront)

//     if (cmndfront == null || cmndback == null) {
//         //console.log("chua nhap anh CMND")
//         $.ajax({
//             url: '/auth/register',
//             type: 'post',
//             data: {
//                 user: user,
//                 cmndback: cmndback,
//                 cmndfront: cmndfront
//             }
//         }).then(data => {
//             if (data.success) {
//                 alert(data.msg)
//                 window.location.href = '/auth/login';
//             }
//             else {
//                 alert(data.msg)
//             }
//         })
//     } else {
//         const cmndfrontName = +new Date() + "-" + cmndfront.name;
//         const cmndfrontMetadata = {
//             contentType: cmndfront.type
//         };
//         const cmndbackName = +new Date() + "-" + cmndback.name;
//         const cmndbackMetadata = {
//             contentType: cmndback.type
//         };



//         const task1 = ref.child(cmndfrontName).put(cmndfront, cmndfrontMetadata);
//         //cmnd sau
//         const task2 = ref.child(cmndbackName).put(cmndback, cmndbackMetadata);




//         //run task
//         task1
//             .then(snapshot => snapshot.ref.getDownloadURL())
//             .then(url => {
//                 //console.log(`front: ${url}`)
//                 task2
//                     .then(snapshot => snapshot.ref.getDownloadURL())
//                     .then(url2 => {
//                         // console.log(`front: ${url}`)
//                         // console.log(`back: ${url2}`)
//                         user.cmndfront = url
//                         user.cmndback = url2
//                         $.ajax({
//                             url: '/auth/register',
//                             type: 'post',
//                             data: {
//                                 user: user
//                             }
//                         }).then(data => {
//                             if (data.success) {
//                                 alert(data.msg)
//                                 window.location.href = '/auth/login';
//                             }
//                             else {
//                                 alert(data.msg)
//                             }
//                         })
//                     })
//                     .catch(console.error);
//             })
//             .catch(console.error);
//     }

// }

//------------------REGISTER END------------------

//------------------LOGIN------------------
function login() {
    $.ajax({
        url: '/auth/login',
        type: 'post',
        dataType: 'JSON',
        data: {
            username: $('#username').val(),
            password: $('#password').val(),
        },
    })
    .then(result => {
        if (result.success) {
            $('#success_login').html(result.msg);
            $('#alert_login').addClass('show');
            setTimeout(function(){
            $('#alert_login').removeClass('show');
            setCookie('token', result.token, 1);
            window.location.href = "/"
            }, 2000);
            // location.reload()
        } else {
            $('#username').html($('#username').val())
            $('#err_signup').html(result.msg);
        }

    }).catch(err => {
        console.log(err)
    })
}

//Get Set cookies
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function logout() {
    $.ajax({
        url: '/auth/logout',
        type: 'post',
    }
    ).then(data => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/"
    }).catch(err => {
        console.log(err)
    })
}
//------------------LOGIN END------------------

//------------------FIRST LOGIN_CHANGE PASSWORD------------------
function changePassword(username) {
    const password = $('#password').val();
    const password2 = $('#password2').val();
    if (password != password2 && (password != null && password2 != null)) {
        alert("Your passwords not match!!! Please enter again!")
    } else {
        $.ajax({
            url: '/auth/changePassword',
            type: 'post',
            data: {
                password: password,
                username: username
            }
        }
        ).then(data => {
            if (data.success) {
                alert(data.msg)
                setTimeout(function () {
                    //your code to be executed after 1 second
                }, 1000);
                window.location.href = "/"
            } else {
                alert(data.msg)
            }

        }).catch(err => {
            console.log(err)
        })
    }
}

//------------------FIRST LOGIN_CHANGE PASSWORD END------------------

// sidebar menu
document.addEventListener("DOMContentLoaded", function(event) {
   
    const showNavbar = (toggleId, navId, bodyId, headerId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId),
    bodypd = document.getElementById(bodyId),
    headerpd = document.getElementById(headerId)
    
    // Validate that all variables exist
    if(toggle && nav && bodypd && headerpd){
    toggle.addEventListener('click', ()=>{
    // show navbar
    nav.classList.toggle('show')
    // change icon
    toggle.classList.toggle('bx-x')
    // add padding to body
    bodypd.classList.toggle('body-pd')
    // add padding to header
    headerpd.classList.toggle('body-pd')
    })
    }
    }
    
    showNavbar('header-toggle','nav-bar','body-pd','header')
    
    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link')
    
    function colorLink(){
    if(linkColor){
    linkColor.forEach(l=> l.classList.remove('active'))
    this.classList.add('active')
    }
    }
    linkColor.forEach(l=> l.addEventListener('click', colorLink))
    
     // Your code to run since DOM is loaded and ready
    });
// 

// rut tien
async function rutTienSubmit() {
    $.ajax({
        url: '/ruttien',
        type: 'post',
        dataType: 'JSON',
        data: {
            maSoThe : $('#maSoThe_Rut').val(),
            ngayHH : $('#ngayHH_Rut').val(),
            maCVV : $('#maCVV_Rut').val(),
            inpMoney : $('#inpMoney_Rut').val(),
            ghiChuRutTien : $('#ghichu_Rut').val()
        }
    }
    )
    .then(result => {
        if (result.success) {
            $('#success_login').html(result.msg);
            $('#alert_login').addClass('show');
            setTimeout(function(){
            $('#alert_login').removeClass('show');
            window.location.href = "/ruttien"
            }, 3000);
            // location.reload()
        } else {
            $('#maSoThe_Rut').html($('#maSoThe_Rut').val())
            $('#ngayHH_Rut').html($('#ngayHH_Rut').val())
            $('#maCVV_Rut').html($('#maCVV_Rut').val())
            $('#inpMoney_Rut').html($('#inpMoney_Rut').val())
            $('#ghichu_Rut').html($('#ghichu_Rut').val())
            $('#err_signup').html(result.msg);
        }

    }).catch(err => {
        console.log(err)
    })
}
function huy(){
    location.reload()
}
let contentRutTien = `<div class="card card-body">
<div class="form-group">
    <label for="inpMoney">Tên người nhận:</label>
    <input type="text" class="form-control" id="fullname_Nhan" name="fullname" required readonly>
  </div>
<div class="form-group">
  <label for="inpMoney">Số tiền cần chuyển: </label>
  <input type="text" class="form-control" id="inpMoney_Chuyen" name="inpMoney" required>
</div>
<div class="form-group" >
    <div>
        <label for="">Phí chuyển tiền:</label>
    </div>
    <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="radioChuyenTien" id="nguoiNhanTra" value ="nguoiNhanTra">
        <label class="form-check-label" for="nguoiNhanTra">
          Người nhận trả
        </label>
      </div>
      <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="radioChuyenTien" id="nguoiChuyenTra" value="nguoiChuyenTra" checked>
          <label class="form-check-label" for="nguoiChuyenTra">
            Người chuyển trả
            </label>
      </div>
</div>
<div class="form-group">
    <label for="ghichu">Ghi chú:</label>
    <textarea name="ghiChuChuyenTien" id="ghichu_Chuyen" class="h-100 form-control " placeholder="Nhập ghi chú.." rows="5"></textarea>
</div>

<span class="text text-danger" id="err_signup"></span>
<span class="text text-success" id="sucess_OTP"></span>
<div class="form-group" id='submitChuyenTien'>
    <button onclick="chuyenTienSubmit()" class="btn btn-primary mt-3"  >Xác nhận</button>
    <button onclick="huy()" class="btn btn-primary mt-3"  >Hủy</button>
</div>
</div>`

let contentOtp = `<label for="otp" >Nhập mã otp: </label>
<input type="text" class="form-control" id="otp" name="otp" >
<div class="form-group">
<button onclick="chuyenTien()" class="btn btn-primary mt-3 mb-3" id="btnCheckOtp">
Chuyển tiền
</button>
</div>
<span class="text text-danger" id="err_checkotp"></span>
`

function checkPhoneUser(){
    $.ajax({
        url: '/checkPhone',
        type: 'post',
        dataType: 'JSON',
        data: {
            phone : $('#phone_Nhan').val(),
           
        }
    })
    .then(result => {
        if (result.success) {
            $('#contentChuyenTien').append(contentRutTien)
            $('#phone_Nhan').attr('readonly', true)
            $('#fullname_Nhan').val(result.msg)
            $('#btnCheckUser').remove()
        } else {
            $('#phone_Nhan').html($('#phone_Nhan').val())
            $('#err_chuyentien').html(result.msg);
        }

    }).catch(err => {
        console.log(err)
    })
}
// chuyen tien
async function chuyenTienSubmit() {
    $.ajax({
        url: '/checkotp',
        type: 'post',
        dataType: 'JSON',
        data: {
            inpMoney : $('#inpMoney_Chuyen').val(),
            phone : $('#phone_Nhan').val(),
            fullname : $('#fullname_Nhan').val(),
            ghiChuChuyenTien : $('#ghichu_Chuyen').val(),
            radioChuyenTien: $("input[type='radio'][name='radioChuyenTien']:checked").val()

        }
    }
    )
    .then(result => {
        if (result.success) {
            $('#sucess_OTP').html('Đã gửi mã OTP đến email của bạn')
            // $('#success_login').html(result.msg);
            // $('#alert_login').addClass('show');
            $('#contentOTP').append(contentOtp)
            // setTimeout(function(){
            // $('#alert_login').removeClass('show');
            // window.location.href = "/chuyentien"
            // }, 3000);
            // location.reload()
        } else {
            $('#inpMoney_Chuyen').html($('#inpMoney_Chuyen').val())
            $('#phone_Nhan').html($('#phone_Nhan').val())
            $('#fullname_Nhan').html($('#fullname_Nhan').val())
            $('#ghichu_Chuyen').html($('#ghichu_Chuyen').val())
            $('#err_signup').html(result.msg);
        }

    }).catch(err => {
        console.log(err)
    })
}
function chuyenTien(){
    
    $.ajax({
    url: '/chuyentien',
    type: 'post',
    dataType: 'JSON',
    data: {
        otp : $('#otp').val(),
        inpMoney : $('#inpMoney_Chuyen').val(),
        phone : $('#phone_Nhan').val(),
        fullname : $('#fullname_Nhan').val(),
        ghiChuChuyenTien : $('#ghichu_Chuyen').val(),
        radioChuyenTien: $("input[type='radio'][name='radioChuyenTien']:checked").val()
    }
})
.then(result => {
    $('#submitChuyenTien').remove()
    if (result.success) {
        alert(result.msg)
    } else {
        $('#otp').html($('#otp').val())
        $('#err_checkotp').html(result.msg);
    }

}).catch(err => {
    console.log(err)
})
}


