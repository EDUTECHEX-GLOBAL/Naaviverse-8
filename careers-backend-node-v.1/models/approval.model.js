const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
{
role:{
type:String,
enum:["Partner","User"],
required:true
},

businessName:String,
type:String,
email:String,
website:String,

firstName:String,
lastName:String,
position:String,
country:String,

status:{
type:String,
enum:["pending","approved","rejected"],
default:"pending"
},

date:{
type:String
}

},
{timestamps:true}
);

module.exports = mongoose.model("Approval",approvalSchema);