const { Schema, model } = require("mongoose");

const DogsCartSchema = new Schema({
    name: String,
    price: Number,
    imageUrl: String,
    tokenDog: String,
    registerDate: Date
})
module.exports = model("dogscarts", DogsCartSchema);