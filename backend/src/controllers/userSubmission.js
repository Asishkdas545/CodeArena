const Problem = require("../models/problem");
const submission = require("../models/submission");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemutility");


const submitCode = async (req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        let {code,language} = req.body;
        if(!userId||!code||!problemId||!language){
            return res.status(400).send("some fields are missing");
        }
        //fetch the problem from database
        const problem = await Problem.findById(problemId);
        if(language==='cpp')
            language='c++'
        //testcases(Hidden)
        //before sending the code to judge0 I will store them in DB
        //because if judge0 have some problem and didn't send you the result
        //and you have not stored that code in DB then user have to submit again
        //which will make user experience bad
        const submittedResult = await submission.create({
            userId,
            problemId,
            code,
            language,
            testCasesPassed:0,
            status:"pending",
            testCasesTotal:problem.HiddenTestCases.length
        })
        //now submit the code to JUDGE0
        const languageId = getLanguageById(language);
        const submissions = problem.HiddenTestCases.map((testcase)=>({
            source_code:code,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }));
        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value)=>value.token);
        const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null;

        for(const test of testResult){
            if(test.status_id == 3){
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory,test.memory);
            }
            else{
                if(test.status_id==4){
                    status = 'error',
                    errorMessage = test.stderr
                }
                else{
                    status = 'wrong',
                    errorMessage = test.stderr
                }
            }
        }

        submittedResult.testCasesPassed = testCasesPassed
        submittedResult.runtime = runtime
        submittedResult.memory = memory
        submittedResult.status = status
        submittedResult.errorMessage = errorMessage

        await submittedResult.save();
        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }
        const accepted = status === "accepted";
        res.status(201).json({
            accepted,
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory
        });
    }
    catch(err){
        res.status(500).send("Error:"+err.message);
    }
}
const runCode = async(req,res)=>{
    
        // 
        try{
        const userId = req.result._id;
        const problemId = req.params.id;

        let {code,language} = req.body;

        if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");

    //    Fetch the problem from database
        const problem =  await Problem.findById(problemId);
    //    testcases(Hidden)
        if(language==='cpp')
            language='c++'

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));


    const submitResult = await submitBatch(submissions);
    
    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for(const test of testResult){
            if(test.status_id==3){
            testCasesPassed++;
            runtime = runtime+parseFloat(test.time)
            memory = Math.max(memory,test.memory);
            }else{
            if(test.status_id==4){
                status = false
                errorMessage = test.stderr
            }
            else{
                status = false
                errorMessage = test.stderr
            }
            }
        }

    
    
    res.status(201).json({
        success:status,
        testCases: testResult,
        runtime,
        memory
    });
        
    }
    catch(err){
        res.status(500).send("Internal Server Error "+ err);
    }
}
module.exports = {submitCode,runCode};
