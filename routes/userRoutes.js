const express=require('express');
const router=express.Router();
const {registerController,loginController,allUsersController} =require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');


router.post('/login',loginController);
router.post('/register',registerController);
router.get('/',protect,allUsersController);
module.exports=router;