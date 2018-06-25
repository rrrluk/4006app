express = require("express");
var app = express();
var bodyParser = require("body-parser");
var fs = require("fs");
const crypto = require("crypto");

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.set("view engine", "ejs");
// ei saa DO reverse proxyt tööle muidu, läheb / kataloogist otsima neid views-i
// app.set('views', '4006app/views');

app.get("/4006app", function (req, res) {
    res.render("home");
    //  res.send("Works");
});

app.post("/4006app/incoming", function (req, res) {
    //  console.log(req.body);
    //   console.log(req.body);
    var dataIn = req.body;
    var sig = req.body.VK_MAC;
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


    //  console.log(macData);
    //  console.log(macDataHash);

    // GET KEY
    // local path
    var pubKey = fs.readFileSync("test-acs-BL_4006.pub");
    // DO reverse proxy path
    // var pubKey = fs.readFileSync("4006app/test-acs-BL_4006.pub");

    // GET DATA
    const verify = crypto.createVerify('RSA-SHA1');
    verify.update(macData);

    // SIGNATURE decode base64
    var sigDecoded = new Buffer(sig, 'base64');

    // VERIFY
    console.log(verify.verify(pubKey, sigDecoded));

    //   console.log(sig);
    //   console.log(macDataHash);

    res.render("received", {
        dataIn: dataIn,
        macData: macData,
        // macDataHash: macDataHash,
        pubKey: pubKey
    });
});


// SERVER START
app.listen(8004, "localhost", function () {
    console.log("4006app started on port 8004!");
});