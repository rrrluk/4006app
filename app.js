express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");
const crypto = require("crypto");
var moment = require('moment');

// Minu variabled
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
    returnUrl = req.body.VK_RETURN;
    var vk_nonce = req.body.VK_NONCE;
    var vk_userId = req.body.VK_USER;
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

    var date = moment().format("YYYYMMDD");
    var time = moment().format("HH:mm:ss");


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

app.post("/4006app/outgoing", function (req, res) {
    console.log(returnUrl);
    // res.redirect(returnUrl);

});


// SERVER START
app.listen(8004, "localhost", function () {
    console.log("4006app started on port 8004!");
});