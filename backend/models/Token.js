const { default: mongoose } = require("mongoose")

const tokenSchema = ({
    Email:String,
    Token:String,
    Status:Boolean,
    registerDate:Date
})
module.exports = mongoose.model("tokens",tokenSchema);