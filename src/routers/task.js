const express =require ('express');
const Task =require('../models/task')
const auth=require('../middleware/auth')
const router =new express.Router();

router.patch('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id

    const updates=Object.keys(req.body)
    const allowedUpdates=['description','completed']

    const isValidOperation=updates.every((update)=>{
        console.log(update)
        return allowedUpdates.includes(update)  
    })

    if(!isValidOperation){
        return res.status(400).send({error:"invalid update"})
    }
 
    try{
       const task= await Task.findOne({_id:req.params.id,owner:req.user._id}) 


       if(!task){
       return res.status(404).send()
       }

       updates.forEach(update => task[update]=req.body[update] );
       await task.save();
       res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})







router.post('/tasks',auth,(req,res)=>{
    const task =new Task({
        ...req.body,
        owner:req.user._id
    })


    task.save().then(()=>{
        res.send(task)
    }).catch((e)=>{
        res.status(400).send(e)
  
    })
})

router.get('/tasks',auth,(req,res)=>{
    req.user.populate('tasks').execPopulate().then((tasks)=>{
        res.send(req.user.tasks)
    }).catch((e)=>{
        res.status(500).send()

    })
})

router.get('/tasks/:id',auth,(req,res)=>{
    const _id=req.params.id

    Task.findOne({_id,owner:req.user._id}).then((task)=>{
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }).catch((e)=>{
        res.status(500).send()

    })
})

router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e)
    }

})

module.exports=router