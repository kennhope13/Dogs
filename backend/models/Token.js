const { default: mongoose } = require("mongoose")

const tokenSchema = ({
    Email:String,
    Token:String,
    Status:Boolean,
    UserID:String,
    registerDate:Date
})
module.exports = mongoose.model("tokens",tokenSchema);