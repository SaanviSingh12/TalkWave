const express=require('express');
const { protect } = require('../middleware/authMiddleware');
const { makeChats, fetchChats, createGroup, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatControllers');
const router=express.Router();

router.post('/',protect,makeChats);
router.get('/',protect,fetchChats);
router.post('/group',protect,createGroup)
router.put('/rename',protect,renameGroup);
router.put('/removeUser',protect,removeFromGroup);
router.put('/addUser',protect,addToGroup);

module.exports=router;