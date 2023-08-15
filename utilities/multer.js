// const multer= require('multer')

// const fileStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "images")
//   },
//   fileName: (req, file, callback) => {
//     callback(null, new Date().toISOString() + " " + file.orginalname);
//   }

// })
// const uplode= multer({
//   storage:fileStorage
  
// })

// // app.use(multer({ dest: "images", storage: fileStorage }).array("image"))
 
//   module.exports ={
//     uplode
//   }
const path = require('path')
const multer=require('multer')
 
const categorystorage = multer.diskStorage({
  destination:(req,res,cb)=>{
      cb(null,'images')
  },
  
  filename:(req,file,cb)=>{
      cb(null,Date.now() + path.extname(file.originalname))
      // cb(null, new Date() +  path.extname(file.originalname));
  }
})

const categoryimageupload = multer({
  storage:categorystorage
})

const upload = categoryimageupload.array('image',4)

module.exports = {upload}
