
const mongoose = require('mongoose')
const { String, Boolean, Number, Date } = require('mongoose/lib/schema/index')

const coupenSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
    },
    percentage:{
        type:Number
    },
    // amount:{
    //     type:Number,
    //     required:true,
    // },
    expireAfter:{
        type : String,
        required : true
    },
    usageLimit:{
        type:Number,
        required:true
    },
    minCartAmount:{
        type:Number,
        required:true
    },
    maxCartAmount:{
        type:Number,
        required:true
    },
    status : {
        type : String,
        default : 'ACTIVE'
    },
    userUser:[
        {
            userId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        }
    ]

},{
    timestamps: true
}
)

const Coupen = mongoose.model('coupon',coupenSchema);
module.exports=Coupen;