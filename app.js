const express = require("express");
const ErrorHandler = require("./middleware/error");
const app=express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors")
const User=require("./model/user")
const jwt = require("jsonwebtoken");
const sendToken = require("./utils/jwtToken");

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use("/", express.static("uploads")); //uploads folder
app.use(bodyParser.urlencoded({extended:true,limit:"50mb"}));


//config
if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({
        path:"backend/config/.env", 
    });
}

//import routes

const user = require("./controller/user");
const shop = require("./controller/shop");
app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.get(
    "/activation/:activation_token",
    (async (req, res, next) => {
      console.log("cxalled");

      try {
        console.log("req.params;")
        const { activation_token } = req.params;
  
        const newUser = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET
        );
  
        if (!newUser) {
        //   return next(new ErrorHandler("Invalid token", 400));
        res.status(400).send("Invalid token")
        return
        }
        console.log("newUser",newUser)
        const { name, email, password, avatar } = newUser;
  
        let user = await User.findOne({ email });
  
        if (user) {
            res.status(400).send("User already exists")
            return

        //   return next(new ErrorHandler("User already exists", 400));
        }
        user = await User.create({
          name,
          email,
          avatar,
          password,
        });
  
        sendToken(user, 201, res);
      } catch (error) {
        console.log(error)
        res.status(500).send(`${error}`)
      }
    })
  );
//It's for ErrorHandling
app.use(ErrorHandler);

module.exports = app; 