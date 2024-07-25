//lF9SzeuC2ekGkYkq
//mongodb+srv://sajanray255:lF9SzeuC2ekGkYkq@cluster0.72rrdjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const mongoose=require('mongoose');
const {Schema,model}=mongoose;

const UserSchema=new Schema({
    username:{type:String,required:true,min:4,unique:true},
    password:{type:String,required:true},
});

const UserModel=model('User',UserSchema);
module.exports=UserModel;