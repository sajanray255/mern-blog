const express =require('express');
const cors=require('cors');
const { default: mongoose } = require('mongoose');
const User=require('./models/User');
const Post=require('./models/Post');
const bcrypt=require('bcryptjs');
const app= express();
const jwt=require('jsonwebtoken'); 
const cookieParser=require('cookie-parser'); //middleware to extract data from cookies
const multer =require('multer');
const uploadMiddleware=multer({dest:'uploads/'}); //middleware to upload files
const fs=require('fs');



const salt=bcrypt.genSaltSync(10); //to encrypt password 
const secret='fcbnsjdn43nrnfni9ni3foinn';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));  //for cross origin data transfer i.e. frontend to backend and vice versa
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads')); //important to add pictures on ui


mongoose.connect('mongodb+srv://sajanray255:lF9SzeuC2ekGkYkq@cluster0.72rrdjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'); //dbconnect

app.post('/register',async (req,res)=>{
const {username,password}=req.body;
try {
    const userDoc=await User.create({             //creating user in mongodb
        username,
        password:bcrypt.hashSync(password,salt),}); //encrypting password
    res.json(userDoc); 
} catch (e) {
     res.status(400).json(e);  
}
});

app.post('/login', async(req,res)=>{
    const{username,password}=req.body;
    const userDoc =await User.findOne({username});     //looking for user in db
    const passOk=bcrypt.compareSync(password,userDoc.password); //checking password

    if(passOk){

        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{  //cookie generation for user login
            if(err) throw err;  
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
            });
         });  
    }
    else{
        res.status(400).json('wrong credentials');
    }
})

app.get('/profile',(req,res)=>{
    const {token}=req.cookies;

    jwt.verify(token,secret,{},(err,info)=>{
        if(err) throw err;
        res.json(info);
    });
});

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
})

app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
    const {originalname,path} =req.file;
    const parts=originalname.split('.');
    const ext=parts[parts.length-1];   //extracting the img extension to add in the path of img file
    const newPath=path+'.'+ext;
    fs.renameSync(path,newPath)   //renaming img file path with new path with extension of file
   
    const {token}=req.cookies;
    jwt.verify(token,secret,{},async (err,info)=>{
        if(err) throw err;
        const {title,summary,content}=req.body; 

   const postDoc =await Post.create({                       //adding new post to database
        title,
        summary,
        content,
        cover:newPath,  
        author:info.id, 
   });
       res.json(postDoc);
        
    });

   
});

app.get('/post',async (req,res)=>{ //getting all posts from database  
    res.json(
        await Post.find()
        .populate('author',['username'])
        .sort({createdAt:-1})
        .limit(20)
    );
})

app.get('/post/:id',async(req,res)=>{
  const {id}=req.params;
  const postDoc=await Post.findById(id).populate('author',['username']);
  res.json(postDoc);
});

app.put('/post',uploadMiddleware.single('file') ,async  (req,res)=>{
      let newPath=null;
   if(req.file){
        const {originalname,path} =req.file;
        const parts=originalname.split('.');
        const ext=parts[parts.length-1];   //extracting the img extension to add in the path of img file
          newPath=path+'.'+ext;
        fs.renameSync(path,newPath)

    }
    
    const {token}=req.cookies;
    jwt.verify(token,secret,{},async (err,info)=>{
        if(err) throw err;
        const {id,title,summary,content}=req.body; 
        const postDoc= await Post.findById(id)
         
        const isAuthor=JSON.stringify(postDoc.author) === JSON.stringify(info.id); 
    
     if(!isAuthor){
       return res.status(400).json('you are not the author');
     }

        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        if (newPath) {
            postDoc.cover = newPath;
        }
        await postDoc.save();  // saving edited details in database
        res.json(postDoc);

    });

});


// post delete  
app.delete('/post/:id', async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const postDoc = await Post.findById(id);

        if (!postDoc) {
            return res.status(404).json('Post not found');
        }

        await Post.findByIdAndDelete(id); //deleting the post from database
        res.json('Post deleted');
    });
});

//



app.listen(4000);