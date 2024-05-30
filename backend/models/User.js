const { model, Schema, Types } = require('mongoose');
const userSchema = new Schema({
    Email: String,
    Name: String,
    Password: String,
    Image: String,
    Usertype: Number,
    RegisterDate: Date
})
module.exports = model("users", userSchema);