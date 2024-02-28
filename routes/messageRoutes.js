const express=require('express');
const {sendMessage,allMessages} =require('../controllers/messageController');
const router=express.Router();

const { protect } = require('../middleware/authMiddleware');


router.post('/',protect,sendMessage);
router.get('/:chatId',protect,allMessages);
module.exports=router;