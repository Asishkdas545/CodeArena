const mongoose = require("mongoose");
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard']
    },
    tags:{
        type:String,
        enum:['Array','string','graph','dp'],
    },
    visibleTestCases:[{
        input:{
            type:String,
            required:true,
        },
        output:{
            type:String,
            required:true,
        },
        explanation:{
            type:String,
            required:true,
        }
    }],
    HiddenTestCases:[{
        input:{
            type:String,
            required:true,
        },
        output:{
            type:String,
            required:true,
        }
    }],
    startCode:[{
        language:{
            type:String,
            required:true,
        },
        initialCode:{
            type:String,
            required:true,
        },

    }],
    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:'user',
        //userSchema ro user ku refer karila
        //auro id ku type re store karidela
        required:true,
    },
    referenceSolution:[{
        //because user nijara test cases bhi deipare 
        //so amaku nijara gote solution ta dabaku hi padibo
        //nahele check kariba kemiti
        language:{
            type:String,
            required:true,
        },
        completeCode:{
            type:String,
            required:true,
        }
    }]
})

const Problem = mongoose.model('problem',problemSchema);
module.exports = Problem;