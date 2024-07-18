
const { Schema, model } = require("mongoose");

const DetailCart1Schema = new Schema({
    Name: String,
    DetailCart: Array,
    userId: String,
    RegisterDate: Date
})
module.exports = model("detailcart1s", DetailCart1Schema)