const userDb = require("../model/userModel")

// const sessionchecker = (req, res, next) => {
//     if (req.session.loginchecker) {
//       next();
//     } else {
//       res.redirect("/login");
//     }
// }

//     exports ={
//         sessionchecker
//     }


// const userBlock = async (req,res,next)=>{
//   const user = await userDb.findOne(req.session.user).lean()
//   if(user.block){
//     res.redirect("/login")
//   }else{
//     next()
//   }

// }

// module.exports = {
//     userBlock
// }



// const userCollection=require("../model/userModel")
// module.exports={
//     userSession:(req,res,next)=>{
//         if(req.session.loggedIn){
//             next()
//         }else{
//             console.log("to login")
//             res.redirect("/login")
//         }
//     },
//     checkBlock:async(req,res,next)=>{
//         let user=await userCollection.findOne({_id:req.session.user._id})
//         // console.log(user)
//         if(user.block===false){
//             next()
//         }else{
//             res.render("users/login")
//             // res.send("user blocked")
//             req.session.destroy()
//         }
//     },
//     noSession:(req,res,next)=>{
//         if(req.session.loggedIn){
//             res.redirect("/")
//         }else{
//             console.log("logged out")
//             next()
//         }
//     }   
// }


const login = (req,res,next) =>{
  if(req.session.userAuthen ){
    next()
  }
  else{
    res.redirect('/login')
  }
}
const isBlock =(req,res,next)=>{
  if(req.session.block){
    console.log("blocked");
    req.session.destroy()
    res.render("users/login",{ user: true ,isBlock :"YOUR ACCOUNT HAS BEEN SUSPENDED" })
  }
  else{
    console.log("not")
    next()
  }
}

module.exports ={
  login,
  isBlock
}