const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require('./routes/problemCreator');
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const cors = require('cors');

app.use(cors({
    //ye kahuchi jau bhi token backend serve karibo taku khali 
    //ehi ip ku serve kare bcz frontend is hoisted in this ip only
    origin:'*',
    credentials:true
}))

//to convert json to js object
app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use("/problem",problemRouter);
app.use("/submission",submitRouter);
app.use('/ai',aiRouter);


const InitializeConnection = async ()=>{
    try{
        //both database should be connected first
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB connected");
        app.listen(process.env.PORT,()=>{
            console.log("server listening at port NUmber: " + process.env.PORT);
        })
    }
    catch(err){
        console.log("Error : "+ err);
    }
}

InitializeConnection();
