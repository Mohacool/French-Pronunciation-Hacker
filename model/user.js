const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
    name: {type:String, required:true},
    password: {type:String, required: true},
    email: {type:String, required: true, unique:true, lowercase:true},
    current_spot: {type:Number,default:0},
    skipped: {type:Array,default:[]}
    },
    { collection: 'users', timestamps: true}
)

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model