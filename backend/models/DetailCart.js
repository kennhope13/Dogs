const { Schema, model } = require("mongoose");

const DetailCartSchema = new Schema({
    Name:String,
    dogItems:Array,
    Address:String,
    TotalPrice:Number,
    userId: String,
    RegisterDate:Date
})
module.exports = model("detailcarts",DetailCartSchema);