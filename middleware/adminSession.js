
const login = (req,res,next) =>{
    if(req.session.adminAuthen ){
      next()
    }
    else{
      res.redirect('/admin')
    }
  }
  module.exports = {
    login
  }