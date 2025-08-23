const validator = require("validator");

const validate = (data)=>{
    const mandatoryField = ['firstName','emailID','password'];
    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));
    if(!IsAllowed)
        throw new Error("some fields are missing");
    if(!validator.isEmail(data.emailID))
        throw new Error("Invalid Email");
    if(!validator.isStrongPassword(data.password))
        throw new Error("weak password");        
}
module.exports = validate;