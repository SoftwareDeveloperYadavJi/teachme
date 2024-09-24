const {Router} = require('express');
const {adminModel, courcesModel} = require('../db');
const {adminMiddleware} = require('../middleware/admin');
const courcesRouter = Router();

courcesRouter.post('/addcource', adminMiddleware, async(req, res)=>{
  try{
    const {title,description,price,image} = req.body;
    const cource = await courcesModel.create({title,description,price,image});
    return res.status(200).send({message:"cource created successfully",cource});
  }catch(error){
    return res.status(500).send({message:"Server error",error:error.message});
  }
})


courcesRouter.put('/updatecource', adminMiddleware, async (req, res) => {
  try {
    const {courceId,title,description,price,image} = req.body;
    const cource = await courcesModel.updateOne({_id:courceId},{title,description,price,image});
    if(!cource){
      return res.status(404).send({message:"cource not found"});
    }
    return res.status(200).send({message:"cource updated successfully",courceId});
  } catch (error) {
    return res.status(500).send({message:"Server error",error:error.message});
  }
});

courcesRouter.get('/allcourses', adminMiddleware, async (req, res) => {
  try {
    const cources = await courcesModel.find();
    return res.status(200).send({cources});
  } catch (error) {
    return res.status(500).send({message:"Server error",error:error.message});
  }
});

courcesRouter.delete('/deletecource', adminMiddleware, async (req, res) => {
  try {
    const {courceId} = req.body;
    const cource = await courcesModel.deleteOne({_id:courceId});
    if(!cource){
      return res.status(404).send({message:"cource not found"});
    }
    return res.status(200).send({message:"cource deleted successfully",courceId});
  } catch (error) {
    return res.status(500).send({message:"Server error",error:error.message});
  }
});


module.exports = {
  courcesRouter: courcesRouter
}