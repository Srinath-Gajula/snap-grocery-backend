const express = require("express");
const path = require("path");
const User = require("../model/user");
const router = express.Router();
const {upload} = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");


router.post("/create-user", upload.single("file"), async(req,res,next) => {
    try{ 
    const {name,email,password} = req.body;
    console.log({name,email,password})  // to print data
    const userEmail = await User.findOne({email});

    if(userEmail){
      //  const filename = req.file.fieldname;  //image
      //  const filePath = 'uploads/${filename}'; //image
      //   fs.unlink(filePath, (err) => {
      //       if(err){
      //           console.log(err);
      //           res.status(500).json({message: "Error deleting file"});
      //       } 
      //   });
        return next(new ErrorHandler("User already exists", 400));
    }

    // const filename = req.file.filename;
    // const fileUrl = path.join(filename);
    


    const user = {
        name: name,
        email: email,
        password: password,
    };

    const activationToken = createActivationToken(user);

    // const activationUrl = `http://localhost:8000/activation/${activationToken}`;
        const activationUrl = `${process.env.domain}/${activationToken}`;


    try {
        await sendMail({
            email: user.email,
            subject: "Activate Your Account",
            //message: `Welcome to SnapGrocery! Hello ${user.name}, please click on the link to activate your account: ${activationUrl} Thank you for choosing SnapGrocery.`,
            message: `Dear ${user.name},\n\nWelcome to SnapGrocery!\n\nWe're delighted to have you as part of our community. To unlock the full potential of your SnapGrocery experience, please click on the following link to activate your account: ${activationUrl}\n\nThank you for choosing SnapGrocery. If you have any questions or need assistance, feel free to reach out to us at SnapGrocery.contact@gmail.com. We're here to help.\n\nBest regards,\nThe SnapGrocery Team`,
          });
          res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to activate your account!`,
          });
    } catch (error) {
        return next(new ErrorHandler(error,message, 500))        
    }

    } catch (error) {
     return next(new ErrorHandler(error.message, 400));
    }



});

//create activation token
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
      expiresIn: "60m",
    });
  };

  //activate user

  

  // login user
    router.post(
    "/login-user",
    catchAsyncErrors(async (req, res, next) => {
      try {
        const { email, password } = req.body;
  
        if (!email || !password) {
          return next(new ErrorHandler("Please provide the all fields!", 400));
        }
  
        const user = await User.findOne({ email }).select("+password");
  
        if (!user) {
          return next(new ErrorHandler("User doesn't exists!", 400));
        }
  
        const isPasswordValid = await user.comparePassword(password);
  
        if (!isPasswordValid) {
          return next(
            new ErrorHandler("Please provide the correct information", 400)
          );
        }
  
        sendToken(user, 201, res);
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

  // load user
router.get(
    "/getuser",
    
    catchAsyncErrors(async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
  
        if (!user) {
          return next(new ErrorHandler("User doesn't exists", 400));
        }
  
        res.status(200).json({
          success: true,
          user,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );
  
  //log out user
  router.get("/logout", async(req,res,) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),  
        httpOnly: true,
      });

      res.status(201).json({
        success: true,
        message: "Log Out successful!" 
      });
    } catch (error) {
      res.status(500).send(`internal server error ${e}`)
    }
  })
 


module.exports = router;