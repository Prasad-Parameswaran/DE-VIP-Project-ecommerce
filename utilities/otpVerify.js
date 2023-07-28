const dotenv = require('dotenv')

dotenv.config({path:'./.env'})


const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const verifySid = process.env.verifySid


const client = require('twilio')(accountSid,authToken);

function sendotp(sendotpphone){
    client.verify.v2
   .services(verifySid)
   .verifications.create({ to:`+91${sendotpphone}`, channel: "sms" })
   .then((verification) => console.log(verification.status));

}

function verifyotp(phone,otp){
    return new  Promise((resolve,reject)=>{
        client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+91${phone}`, code: otp })
         .then((verification_check) => {console.log(verification_check.status)
         resolve(verification_check)})
        })
  

}
module.exports = {
    sendotp,
    verifyotp

}