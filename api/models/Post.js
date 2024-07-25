const mongoose =require('mongoose');
const {Schema,model}=mongoose;
 //new collection for storing posts created by user in database
const PostSchema=new Schema({
  title:String,
  summary:String,
  content:String,
  cover:String,
  author:{type:Schema.Types.ObjectId,ref:'User'},
},
{
    timestamps:true,
});

const PostModel=model('Post',PostSchema);
module.exports=PostModel;
