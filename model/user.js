const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
    name: {type:String, required:true},
    password: {type:String, required: true},
    email: {type:String, required: true, unique:true, lowercase:true},
    current_spot: {type:Number,default:0},
    skipped: {type:Array,default:[]},
    daily_objective: {type:Number,default:0},
    verify_pin: {type:String,default:"0000"},
    verified: {type:Boolean, default:false},
    last_objective_completion: {type:String,default:''},
    progress: {type:Array}
    },
    { collection: 'users', timestamps: true}
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model