const mongoose=require("mongoose")

const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true,
        uppercase:true,
        unique:true
    },
    imageUrl:{
        type:Array,
        required:true
    },
    description:{
        type:String,
        required:true,
        max:100
    },
    offer:{
        type:Number,
        default:0
    },
    block:{
        type:Boolean,
        degfault:false
    }
},
{timestamps:true}
)
module.exports=mongoose.model('categoryCollection',categorySchema)