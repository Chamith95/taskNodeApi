const express =require ('express');
const User =require('../models/user')
const user=require('../models/task')
const auth=require('../middleware/auth')
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
        res.send({user,token})
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

router.get('/users/:id',(req,res)=>{
    const _id=req.params.id

    User.findById(_id).then((user)=>{
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }).catch((e)=>{
        res.status(500).send()

    })
})

router.delete('/users/:id',async(req,res)=>{
    try{
        const user=await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user);
    }catch(e){
        res.status(500).send(e)
    }

})

router.patch('/users/:id',async (req,res)=>{
    const _id=req.params.id

    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error:"invalid update"})
    }
 
    try{
       const user= await User.findById(_id,req.body) 

        updates.forEach((update)=>user[update]=req.body[update])

        await user.save()

       if(!user){
       return res.status(404).send()
       }
       res.send(user);
    }catch(e){
        res.status(400).send(e)
    }
})


module.exports=router; 