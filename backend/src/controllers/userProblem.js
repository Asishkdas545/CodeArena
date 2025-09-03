const {getLanguageById,submitBatch,submitToken} = require("../utils/problemutility");
const Problem = require("../models/problem");
const User = require("../models/user");
const submission = require("../models/submission");


const createProblem = async (req,res)=>{

    const {title,description,difficulty,tags,visibleTestCases,
        HiddenTestCases,startCode,problemCreator,referenceSolution
    } = req.body;

    try{
        for(const {language,completeCode} of referenceSolution){
            
            //source code
            //language id
            //stdin:
            //expected output
            const languageId = getLanguageById(language);
            //I am creating Batch submission
            const submissions = visibleTestCases.map((testcase)=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

            const submistResult = await submitBatch(submissions);
            //await because it will go to JUDGE0
            //this will give me no. of tokens equal to no. of testcases
            const resultToken = submistResult.map((value)=>value.token);
            const testResult = await submitToken(resultToken);
            for(const test of testResult){
                if(test.status_id!=3){
                    //aiti tu sabu status_id paen different different resposnse pathei paribu
                    res.status(400).send("Error Occured");
                }
            }
        }
        //now we can store them in Database
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator:req.result._id
        });
        res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error:"+err.message);
    }
}
const UpdateProblem = async (req,res)=>{
    const {id} = req.params;
    const {title,description,difficulty,tags,visibleTestCases,
        HiddenTestCases,startCode,problemCreator,referenceSolution
    } = req.body;
    try{
        if(!id){
            //return lekhile aagaku chaliboni boli lekhanti
            return res.status(400).send("Missing ID field");
        }
        for(const {language,completeCode} of referenceSolution){
            
            //source code
            //language id
            //stdin:
            //expected output
            const languageId = getLanguageById(language);
            //I am creating Batch submission
            const submissions = visibleTestCases.map((testcase)=>({
                source_code:completeCode,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }));

            const submistResult = await submitBatch(submissions);
            //await because it will go to JUDGE0
            //this will give me no. of tokens equal to no. of testcases
            const resultToken = submistResult.map((value)=>value.token);
            const testResult = await submitToken(resultToken);
            for(const test of testResult){
                if(test.status_id!=3){
                    //aiti tu sabu status_id paen different different resposnse pathei paribu
                    res.status(400).send("Error Occured");
                }
            }
        }
        const DsaProblem = await Problem.findById(id);
        if(!DsaProblem){
            return res.status(404).send("ID is not present in server");
        }
        //update karila pare new problem taku se newProblem bhitare purei daba sethi paen tu new:true lekhichu
        const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
        res.status(200).send(newProblem);

    }
    catch(err){
        res.status(500).send("Error:"+err.message);
    }
}

const deleteProblem = async(req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return res.status(400).send("ID is missing");
        }
        const deletedProblem = await Problem.findByIdAndDelete(id);
        if(!deletedProblem){
            return res.status(404).send("Problem is Missing");
        }
        res.status(200).send("Successfully Deleted");
    }
    catch(err){
        res.status(500).send("Error:"+err.message);
    }
}
const getProblemById = async(req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return res.status(400).send("ID is Missing");
        }
        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
        if(!getProblem){
            return res.status(400).send("problem is missing");
        }
        res.status(200).send(getProblem);
    }
    catch(err){
        res.status(500).send("Error:"+err.message);
    }
}
const getAllProblem = async(req,res)=>{
    try{
        const allProblem = await Problem.find({}).select('_id title difficulty tags');
        if(allProblem.length==0){
            return res.status(404).send("Problem is Missing");
        }
        res.status(200).send(allProblem);
    }
    catch(err){
        res.status(500).send("Error:"+err.message);
    }
}
const solvedAllProblembyUser = async(req,res)=>{
    try{
        const userId = req.result._id;
        //it is saying to go to that problemId and bring these selected things and store them in problemSolved
        //rather than just storing the problemId
        const people = await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        });
        res.status(200).send(people.problemSolved);
    }
    catch(err){
        res.status(400).send("Error:"+err.message);
    }
}
const submittedProblem = async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;
        const ans = await submission.find({userId,problemId});
        if(ans.length == 0)
            return res.status(200).send([]);
        res.status(200).send(ans);
    }
    catch(err){
        res.status(500).send("Internal server error");
    }
}

module.exports = {createProblem,UpdateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};