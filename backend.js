var PORT = process.env.PORT || 5000
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GOOGLE_CLIENT_ID = '276071755442-7m808pm3so1s0kmt3rmuqtpr5315p8l2.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app = express();
const oriArr=[];
var search = "";
var searchStr = "";
var numLength;
let option;
var heightBox = "";
var widthSearch = "";
var seaAbt="";
var unavaResults ="";
var resAbt="";
const destArr=[];
const priceArr=[];
const flightnArr=[];
const departArr=[];
const returnArr=[];
const transferArr=[];
const airnameArr=[];
const numArr=[];
var x;
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
    app.use(session
      ({ secret: 'anything',
         resave: false,
         saveUninitialized: false }));

    app.use(passport.initialize());
    app.use(passport.session());

    mongoose.connect("mongodb+srv://admin-fevin:Test123@firstcluster0.4trarva.mongodb.net/?retryWrites=true&w=majority/loginDB",{useNewUrlParser: true});
    const loginSchema = new mongoose.Schema({
      email: String,
      password: String
    });

    loginSchema.plugin(passportLocalMongoose);
    loginSchema.plugin(findOrCreate);
    const Login = new mongoose.model("Login", loginSchema);

    passport.use(Login.createStrategy());

    passport.serializeUser(function(login, done){
      done(null, login.id)
    });
    passport.deserializeUser(function(id, done){
      Login.findById(id, function(err,login){
        done(err, login);
      });
    });

    passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://searplore.herokuapp.com/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    Login.findOrCreate({ googleId: profile.id }, function (err, login) {
      return cb(err, login);
    });
  }
));

    app.get("/search",function(req , res){
       options = {
        method: 'GET',
        url: 'https://travelpayouts-travelpayouts-flight-data-v1.p.rapidapi.com/v1/city-directions',
        params : {currency: 'USD',origin:searchStr},
        headers: {
          'X-Access-Token': '9ad7979ba03bd939e93bf75272fe5beb',
          'X-RapidAPI-Key': '3491072d5fmsh3bf582674c53b81p1dd9d1jsndd4c1bc580a2',
          'X-RapidAPI-Host': 'travelpayouts-travelpayouts-flight-data-v1.p.rapidapi.com'
        }
      };
      axios.request(options).then(function(response) {
        var l = Object.entries(response.data.data);
        numLength= l.length;
         if(searchStr === "" || numLength === 0 || searchStr.length < 3 ){
          numLength = "";
          heightSearch = 0;
          widthSearch = "";
          seaAbt="";
          resAbt="";
          heightBox = 0;
        }else {
        heightBox = "";
          widthSearch = "search-results";
          seaAbt="About";
          resAbt="search results";
        }
        for(var i=0; i<numLength;i++){
          var origins = l[i][1].origin;
        oriArr.push(origins);

        var destinations = l[i][1].destination;
        destArr.push(destinations);

        var prices = l[i][1].price;
        priceArr.push(prices);

        var flightNum = l[i][1].flight_number;
        flightnArr.push(flightNum);

        var depart = l[i][1].departure_at;
        var newDepart = depart.replace('T'," 𝗧𝗶𝗺𝗲:- ");

        departArr.push(newDepart);
        var returns = l[i][1].return_at;

        var newreturns = returns.replace('T'," 𝗧𝗶𝗺𝗲:- ");
        returnArr.push(newreturns);

        var transfer = l[i][1].transfers;
        transferArr.push(transfer);

        var airName = l[i][1].airline;
        airnameArr.push(airName);

        var numTrack = i;
        numArr.push(numTrack);
      }
      if(req.isAuthenticated()){
        res.render("main",{kindOfOri:oriArr,kindOfDest:destArr,kindOfPrice:priceArr,kindOfFlightN:flightnArr,kindOfDept:departArr
          ,kindOflength:numLength,KindOfReturn:returnArr,kindOfTransfers:transferArr,kindOfAir:airnameArr,kindOfNum:numArr,kindOfHeight:heightSearch,
        kindOfWidth:widthSearch,kindOfAbout:seaAbt,kindOfSearch:resAbt,kindOfBox:heightBox});
      }else{
        res.redirect("/");
      }
    }).catch(function (error) {
      res.render("main",{kindOfOri:oriArr,kindOfDest:destArr,kindOfPrice:priceArr,kindOfFlightN:flightnArr,kindOfDept:departArr
        ,kindOflength:numLength,KindOfReturn:returnArr,kindOfTransfers:transferArr,kindOfAir:airnameArr,kindOfNum:numArr,kindOfHeight:heightSearch,
      kindOfWidth:widthSearch,kindOfAbout:seaAbt,kindOfSearch:resAbt,kindOfBox:heightBox});
});

  });

  app.get("/auth/google",
  passport.authenticate('google', { scope: ['email','profile'] }));

  app.get("/google/callback",
    passport.authenticate('google', { failureRedirect: "/" }),
    function(req, res) {
      res.redirect("/search");
    });

    app.post("/search",function(req,res){
      search = req.body.searchFlight;
      searchStr = search.toString();
      unavaResults = "";
      oriArr.splice(0,30);
      destArr.splice(0,30);
      priceArr.splice(0,30);
      flightnArr.splice(0,30);
      departArr.splice(0,30);
      returnArr.splice(0,30);
      transferArr.splice(0,30);
      airnameArr.splice(0,30);
      res.redirect("/search");
        });

    app.get("/", function(req, res){
      res.render("login");
    });
    app.get("/register", function(req, res){
      res.render("register");
    });

    app.post("/register", function(req, res){
      Login.register({username:req.body.username}, req.body.password, function(err, login){
        if(err){
          console.log(err);
          res.redirect("/register");
        }else{
          passport.authenticate("local")(req, res, function(){
            res.redirect("/search");
          });
        }
      });
    });
    app.post("/", function(req, res){
      const login = new Login({
        username: req.body.username,
        password: req.body.password,
      });

      req.login(login, function(err){
        if(err){
          console.log(err);
            res.redirect("/");
        } else{
          passport.authenticate("local")(req, res, function(){
            res.redirect("/search");
          })
        }
      });
    });


app.listen(PORT,function(){
  console.log("server has started successfully.");
});
