const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
mongoose.Promise = global.Promise;
const app = express();
mongoose.connect('mongodb://localhost:27017/auth');
app.use(bodyParser.json())
app.use(cookieParser());
const {User} = require('./models/user')
const {auth} = require('./middleware/auth');
app.post('/api/user',(req,res)=>{
    const user = new User({
        email:req.body.email,
        password:req.body.password
    })
    user.save((err,doc)=>{
        if(err) res.status(400).send(err)
        res.status(200).send(doc);
    })
})
//ok
app.post('/api/user/login',(req,res)=>{
    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) res.json({message:'Auth failed,user not found'})
        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(err) throw err
            if(!isMatch) res.status(400).json({
                message:'Wrong Password'
            })
            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err)
                res.cookie('auth',user.token).send('ok');
            }) 
        })
    })
})

app.get('/user/profile',auth,(req,res)=>{
    res.status(200).send(req.token);
})

const port = process.env.Port || 3000;
app.listen(port,()=>{
    console.log(`Started running on port 3000!!`);
});
