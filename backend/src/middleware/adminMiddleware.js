const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");
require("dotenv").config();

const adminMiddleware = async (req,res,next)=>{
    try{
        //token is present in req.cookies
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present");
        //if token present then I will check it's validity
        const payload = jwt.verify(token,process.env.JWT_TOKEN);
        const {_id} = payload;
        if(!_id){
            throw new Error("Invalid Token");
        }
        const result = await User.findById(_id);

        if(payload.role!='admin')
            throw new Error("Invalid Token");

        if(!result){
            throw new Error("User Doesn't Exist");
        }
        //now user exists
        //now I have to check if that user is present in my redis
        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;

        next();
    }
    catch(err){
        res.status(401).send("Error : "+ err.message);
    }
}

module.exports = adminMiddleware;