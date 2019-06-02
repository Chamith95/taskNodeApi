const express =require ('express');
const User =require('../models/user')
const user=require('../models/task')
const multer=require('multer')
const auth=require('../middleware/auth')
const sharp=require('sharp')
const router =new express.Router();

router.post('/users',async (req,res)=>{
    const user =new User(req.body)

    try{
        await user.save()
        const token =await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
  
    // user.save().then(()=>{
    //     res.send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
  
    // })
})

router.post('/users/login',async(req,res)=>{
    try{
        const user= await User.findByCredentials(req.body.email,req.body.password)
        const token =await user.generateAuthToken()
        res.send({ user ,token})
    }
    catch(e){
        res.status(400).send(e); 
    }
})

router.post('/users/logout', auth, async (req,res)=>{
    console.log(req.token);
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save();

        res.send()
    }
    catch(e){
        res.status(500).send( )
    }
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save();

        res.send()
    }
    catch(e){
        res.status(500).send( )
    }
})

router.get('/users/me',auth,(req,res)=>{
    res.send(req.user);
})



router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }

})

router.patch('/users/me',auth,async (req,res)=>{
    const _id=req.user.id

    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error:"invalid update"})
    }
 
    try{

        updates.forEach((update)=>req.user[update]=req.body[update])

        await req.user.save()
        res.send(req.user);
    }catch(e){
        res.status(400).send(e)
    }
})

const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }

        cb(undefined,true)

    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
     req.user.avatar=buffer
    await req.user.save()
    res.send()
}),(error,req,res,next)=>{
    res.status(400).send({error:error.message})
}

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user =await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports=router; 