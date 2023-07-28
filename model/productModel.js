const mongoose = require('mongoose')

const product_schema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
   
    category: {
        type:String
      },

    description: {
        type : String,
       
    },
    // size:{
    //     type:String,
    //     required:true
    // },
    discount:{
        type:Number

    },
    imageUrl: {
        type : Array,
    },
    
    stock:{
        type:Number,
        required:true
    }



},
{
    timestaps:true
})

const products = mongoose.model('Product' , product_schema)
module.exports = products;