const { Schema, model } = require("mongoose");

const DogsCartSchema = new Schema({
    dogItems:Array,
    tokenDog: String,
    registerDate: Date,
    userId: String
})
module.exports = model("dogscarts", DogsCartSchema);