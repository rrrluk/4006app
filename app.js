express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");
const crypto = require("crypto");
var moment = require('moment');

// Minu variabled
var vk_service = "";
var vk_version = "";
var vk_snd_id = "";
var vk_rec_id = "";
var vk_nonce = "";
var date = "";
var time = "";
var vk_userId = "";
var threeD_enroll = "";
var threeD_cavv = "";
var threeD_txstatus = "";
var vk_resp = "";
var threeD_eci = "";
var threeD_cavv_alg = "";
var threeD_error_code = "";
var vk_charset = "UTF-8";
var returnUrl = "";

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.set("view engine", "ejs");
// ei saa DO reverse proxyt tööle muidu, läheb / kataloogist otsima neid views-i
app.set('views', '4006app/views');

app.get("/4006app", function (req, res) {
    res.render("home");
    //  res.send("Works");
});

app.post("/4006app/incoming", function (req, res) {
    //  console.log(req.body);
    //   console.log(req.body);
    var dataIn = req.body;
    var sig = req.body.VK_MAC;
    vk_service = req.body.VK_SERVICE;
    vk_version = req.body.VK_VERSION;
    vk_snd_id = req.body.VK_SND_ID;
    vk_rec_id = req.body.VK_REC_ID;
    returnUrl = req.body.VK_RETURN;
    vk_nonce = req.body.VK_NONCE;
    vk_userId = req.body.VK_USER;
    var macData = "";

    // loobib üle req.body ja paneb kokku stringi maci arvutamise jaoks
    Object.keys(dataIn).forEach(function (k) {
        if (k != "VK_MAC") {
            var item = dataIn[k];
            if (item.length < 10) {
                macData += "00" + item.length + item;
            } else if (item.length < 100) {
                macData += "0" + item.length + item;
            } else {
                macData += item.length + item;
            }
        }
    });

    // GET KEY
    // local path
    // var pubKey = fs.readFileSync("test-acs-BL_4006.pub");
    // DO reverse proxy path
    var pubKey = fs.readFileSync("4006app/test-acs-BL_4006.pub");

    // INIT verfiy
    const verify = crypto.createVerify('RSA-SHA1');
    // GET DATA to verify
    verify.update(macData);

    // SIGNATURE decode base64
    var sigDecoded = new Buffer(sig, 'base64');

    // VERIFY
    // console.log(verify.verify(pubKey, sigDecoded));
    var vResult = verify.verify(pubKey, sigDecoded);

    Object.keys(dataIn).forEach(function (k) {
        console.log(k + " - " + dataIn[k]);
    });

    date = moment().format("YYYYMMDD");
    time = moment().format("HH:mm:ss");


    res.render("received", {
        dataIn: dataIn,
        returnUrl: returnUrl,
        vk_nonce: vk_nonce,
        date: date,
        time: time,
        vk_userId: vk_userId,
        macData: macData,
        pubKey: pubKey,
        vResult: vResult,
    });
});

app.get("/4006app/outgoing", function (req, res) {

    vk_service = "3006";
    vk_snd_id_out = vk_rec_id;
    vk_rec_id_out = vk_snd_id;
    threeD_enroll = "Y";
    threeD_txstatus = "Y";
    vk_resp = "Y";
    threeD_error_code = "0000";
    var macDataOutString = "";
    var vk_mac = "";

    date = moment().format("YYYYMMDD");
    time = moment().format("HH:mm:ss");


    var macDataOut = [
        vk_service, vk_version, vk_snd_id_out, vk_rec_id_out, vk_nonce, date, time, vk_userId, threeD_enroll, threeD_cavv, threeD_txstatus, vk_resp, threeD_eci, threeD_cavv_alg, threeD_error_code, vk_charset,
    ];

    macDataOut.forEach(function (item) {
        if (item.length < 10) {
            macDataOutString += "00" + item.length + item;
        } else if (item.length < 100) {
            macDataOutString += "0" + item.length + item;
        } else {
            macDataOutString += item.length + item;
        }
    });

    const sign = crypto.createSign('RSA-SHA1');
    sign.update(macDataOutString);

    var priKey = fs.readFileSync("4006app/test-acs-BL_4006.key");

    vk_mac = sign.sign(priKey, "base64");


    res.render("out", {
        returnUrl: returnUrl,
        vk_service: vk_service,
        vk_version: vk_version,
        vk_snd_id_out: vk_snd_id_out,
        vk_rec_id_out: vk_rec_id_out,
        vk_nonce: vk_nonce,
        date: date,
        time: time,
        vk_userId: vk_userId,
        threeD_enroll: threeD_enroll,
        threeD_cavv: threeD_cavv,
        threeD_cavv_alg: threeD_cavv_alg,
        threeD_txstatus: threeD_txstatus,
        vk_resp: vk_resp,
        threeD_eci: threeD_eci,
        threeD_error_code: threeD_error_code,
        vk_charset: vk_charset,
        macDataOutString: macDataOutString,
        vk_mac: vk_mac,
    });

});


// SERVER START
app.listen(8004, "localhost", function () {
    console.log("4006app started on port 8004!");
});