const express = require('express');
//for routing
const authRouter = express.Router();
const {register,login,logout,adminRegister,deleteProfile} = require("../controllers/userAuthentication");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

//register
authRouter.post('/register',register);
//login
authRouter.post('/login',login);
//logout
authRouter.post('/logout',userMiddleware,logout);
//GetProfile
//authRouter.get('/getProfile',getProfile);
//for registering admin and only another admin can makin him registered as admin
//so first we have to varify that it is admin
//so for this we will create admin MIddleware
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/profile',userMiddleware,deleteProfile);
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply = {
        firstName:req.result.firstName,
        emailID:req.result.emailID,
        _id:req.result._id,
        role:req.result.role,
    }
    res.status(200).json({
        user:reply,
        message:"valid user"
    })
    //if there is an error that will automatically get handled by userMiddleware
})
//I will write these functions inside my controller folder
module.exports = authRouter;