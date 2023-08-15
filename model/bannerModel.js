const mongoose= require('mongoose')
const { String, Array, Number } = require('mongoose/lib/schema/index')

const bannerSchema= new mongoose.Schema({
    Heading:{
        type:String,
        required:true
    },
    Discription:{
        type:String,
        required:true
    },
    // Offer:{
    //     type:Number,
    //     required:true

    // },
    Url:{
        type:String,
        required:true
    },
    imageUrl:{
        type:Array,
        required:true
    },
    status : {
        type : String,
        default : 'ACTIVE'
    }


},{
    timestamps:true
})

const Banner= mongoose.model('banner',bannerSchema)
module.exports=Banner