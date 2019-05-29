const express =require ('express');
const Task =require('../models/task')
const router =new express.Router();

router.patch('/tasks/:id',async (req,res)=>{
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
       const task= await Task.findByIdAndUpdate(_id,req.body,{ new:true, runValidators:true}) 
       if(!task){
       return res.status(404).send()
       }
       res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})







router.post('/tasks',(req,res)=>{
    const task =new Task(req.body)
    task.save().then(()=>{
        res.send(task)
    }).catch((e)=>{
        res.status(400).send(e)
  
    })
})

router.get('/tasks',(req,res)=>{
    Task.find({}).then((tasks)=>{
        res.send(tasks)
    }).catch((e)=>{
        res.status(500).send()

    })
})

router.get('/tasks/:id',(req,res)=>{
    const _id=req.params.id

    Task.findById(_id).then((task)=>{
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }).catch((e)=>{
        res.status(500).send()

    })
})

router.delete('/tasks/:id',async(req,res)=>{
    try{
        const task=await Task.findByIdAndDelete(req.params.id)
        if(!task){
            return res.status(404).send()
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e)
    }

})

module.exports=router