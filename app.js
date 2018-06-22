 express = require("express");
 var app = express();
 var bodyParser = require("body-parser")
 var fs = require("fs");
 const crypto = require('crypto');

 app.use(bodyParser.urlencoded({
     extended: true
 }));

 app.set("view engine", "ejs");
 // ei saa DO reverse proxyt tööle muidu, läheb / kataloogist otsima neid views-i
 //  app.set('views', '4006app/views');

 app.get("/4006app", function (req, res) {
     res.render("home");
     //  res.send("Works");
 });

 app.post("/4006app/incoming", function (req, res) {
     //  console.log(req.body);
     //   console.log(req.body);
     var dataIn = req.body;
     var macData = "";

     // loobib üle req.body ja paneb kokku stringi maci arvutamise jaoks
     Object.keys(dataIn).forEach(function (k) {
         if (k != "VK_MAC") {
             var item = dataIn[k]
             if (item.length < 10) {
                 macData += "00" + item.length + item;
             } else if (item.length < 100) {
                 macData += "0" + item.length + item;
             } else {
                 macData += item.length + item;
             }
         };
     });

     var macDataHash = crypto.createHash('sha1').update(macData).digest("hex");

     //  console.log(macData);
     //  console.log(macDataHash);

     // local path
     var pubKey = fs.readFileSync("test-acs-BL_4006.pub", "utf8");
     // reverse proxy path
     //  var pubKey = fs.readFileSync("4006app/test-acs-BL_4006.pub", "utf8");
     //  console.log(pubKey);

     //  Object.keys(req.body).forEach(function (k) {
     //      if (k != "VK_MAC") {
     //          console.log(k + ' - ' + req.body[k]);
     //      };
     //  });

     res.render("received", {
         dataIn: dataIn,
         macData: macData,
         macDataHash: macDataHash,
         pubKey: pubKey,
     });
     //  res.send("incoming!");

 });


 app.listen(8004, "localhost", function () {
     console.log("4006app started!");
 });