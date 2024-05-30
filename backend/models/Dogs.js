const { model, Schema, Types } = require('mongoose');
const dogSchema = new Schema({
    name:String,
    breed:String,
    decription:String,
    price:Number,
    imageUrl:String,
    registerDate:Date
})
module.exports = model("dogs",dogSchema);