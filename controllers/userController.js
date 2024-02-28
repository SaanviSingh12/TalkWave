const User=require('../models/userModel')
const generateToken=require('../config/generateToken');
const { comparePassword, hashPassword } =require('../helper/authHelper');

const registerController = async (req, res) => {
   const { name, email, password, pic } = req.body;
   try {
       if (!name || !email || !password) {
           return res.status(400).send("Details missing");
       }

       let userExist = await User.findOne({ email });

       if (userExist) {
           return res.status(400).send("User Already Exists");
       }

       const hashedPassword = await hashPassword(password);

       const user = await User.create({
           name,
           email,
           password:hashedPassword,
           pic,
       });

       if (user) {
           return res.status(201).json({
               _id: user._id,
               name: user.name,
               email: user.email,
               pic: user.pic,
               token: generateToken(user._id),
           });
       } else {
           return res.status(400).send("Registration Unsuccessful");
       }
   } catch (error) {
       
       return res.status(500).send("Internal Server Error");
   }
};

const loginController=async(req,res)=>{
   try{
      const {email,password}=req.body;
      const user = await User.findOne({ email });
      if (!user) {
      return res.status(404).send({
         success: false,
         message: "Email is not registerd",
      });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
      return res.status(400).send("Invalid Email/Password");  
   }
   return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),})

   }
   catch (error) {
     
      return res.status(500).send("Internal Server Error");
  }

}

// search User 
const allUsersController=async(req,res)=>{
     try{
        const keyword=req.query.search ?{
            $or:[
                {name:{$regex:req.query.search ,$options:"i"}},
                {email:{$regex:req.query.search ,$options:"i"}},
            ]
         }:{};
    
         const users=await User.find(keyword).find({_id:{$ne:req.user._id}});
         if(users){
           return res.status(200).send(users);
         }else{
            return res.status(400).send("User not found");
         }
        
     }catch(err){
        return res.status(400).send("Some error occured",err);
     }
} 

module.exports={registerController,loginController,allUsersController};