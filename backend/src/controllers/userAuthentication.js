const User = require("../models/user");
const validator = require('../utils/validate');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");
require("dotenv").config();
const submission = require("../models/submission")

const register = async (req,res)=>{
    try{
        console.log("hello1");
        validator(req.body);
        const {firstName,emailID,password} = req.body;
        req.body.password = await bcrypt.hash(password,10);
        //using this path whoever will come will be cosidered as user only
        req.body.role = 'user';
        const user = await User.create(req.body);
        const reply = {
            firstName:user.firstName,
            emailID:user.emailID,
            _id:user._id,
        }
        //there is a method for generating random jwt secret key
        //I am putting role also because I dont want to call database again and again
        console.log("hello2");
        const token = jwt.sign({_id:user._id,emailID:emailID,role:'user'},process.env.JWT_TOKEN,{expiresIn:3600});
        console.log("hello3");
        res.cookie('token',token,{maxAge: 60*60*1000});
        console.log("hello4");
        res.status(201).json({
            user:reply,
            message:"Registered Successfully"
        });
    }
    catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

const login = async (req,res)=>{
    try{
        const {emailID,password} = req.body;
        if(!emailID)
            throw new Error("Invalid credentials");
        if(!password)
            throw new Error("Invalid credentails");
        //if that email exists then find that out
        const user = await User.findOne({emailID});
        const match = await bcrypt.compare(password,user.password);
        if(!match)
            throw new Error("Invalid credentials");
        //kyu ki login toh hamara admin bhi kar sakta hai na
        const reply = {
            role:user.role,
            firstName:user.firstName,
            emailID:user.emailID,
            _id:user._id
        }
        const token = jwt.sign({_id:user._id,emailID:emailID,role:user.role},process.env.JWT_TOKEN,{expiresIn:3600});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(200).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).send("Error :"+err.message);
    }
}

const logout = async (req,res)=>{
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged out Successfully");
    }
    catch(err){
        res.status(503).send("Error :"+err.message);
    }
}
const adminRegister = async (req,res)=>{
    try{
        validator(req.body);
        const {firstName,emailID,password} = req.body;
        req.body.password = await bcrypt.hash(password,10);
        //using this path whoever will come will be cosidered as user only
        //req.body.role = 'admin';
        const user = await User.create(req.body);
        //there is a method for generating random jwt secret key
        //I am putting role also because I dont want to call database again and again
        //console.log(process.env.JWT_TOKEN);
        const token = jwt.sign({_id:user._id,emailID:emailID,role:user.role},process.env.JWT_TOKEN,{expiresIn:3600});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).send("user registered successfully");
    }
    catch(err){
        res.status(400).send("Error : "+err.message);
    }
}
const deleteProfile = async(req,res)=>{
    try{
        const userId = req.result._id;
        //deleted from userSchema
        await User.findByIdAndDelete(userId);
        //also delete from submission
        // await submission.deleteMany({userId});
        //==>aita use na kariki bhi tu kariparibu jauta tu sumission file re lekhichu
        res.status(200).send("Deleted successfully");
    }
    catch(err){
        res.status(500).send("Internal server Error");
    }
}
module.exports = {register,login,logout,adminRegister,deleteProfile};