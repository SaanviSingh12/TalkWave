const Chat=require('../models/chatModel');
const User = require('../models/userModel');

// start a chat 
const makeChats=async(req,res)=>{
    const {userId} =req.body;
    if(!userId){
        return res.status(400).send("User id not given");
    }
    
    var isChat=await Chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ]
    }).populate("users","-password").populate("latestMessage");


    isChat=await User.populate(isChat,{
        path:"latestMessage.sender",
        select:"name pic email",
    });

    if(isChat.length>0){
        return res.status(200).send(isChat[0]);
    }else{
        var chatData={
            chatName:"sender",
            isGroupChat:false,
            users:[req.user._id,userId],
        }
    }
    try{
        const createChat=await  Chat.create(chatData);
        const fullChat=await Chat.findOne({_id:createChat._id}).populate("users","-password");
        return res.status(200).send(fullChat);
    }catch(err){
        return res.status(400).send("Faild to create chat");
    }

}

// fetch all the chats 
const fetchChats=async(req,res)=>{
   try{
      Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updateAt:-1})
        .then(async(results)=>{
            results=await User.populate(results,{
                path:"latestMessage.sender",
                select:"name pic email",
            });
            res.status(200).send(results);
        })

   }catch(err){
    return res.status(400).send("No chats ")
   }
}

// create Group chat
const createGroup=async(req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"Please Fill all the fields"});
    }
    var users=JSON.parse(req.body.users);
    if(users.length<2){
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);
    try{
        const groupChat=await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user,
        });

        const fullGroupChat=await Chat.findOne({_id:groupChat.id})
            .populate("users","-password")
            .populate("groupAdmin","-password");

        return res.status(200).json(fullGroupChat);

    }catch(err){
        return res.status(400).send("Error while creating group")
    }

}
// Rename existing group
const renameGroup=async(req,res)=>{
  try{
    const {chatId,chatName}=req.body;
    const updatedName=await Chat.findByIdAndUpdate(
        chatId,{
            chatName,
        },
        {
            new:true,
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password");

    if(!updatedName){
      return  res.status(400).send("Error while changing Name ");
    }else{
        return res.status(200).send(updatedName);
    }
  }catch(err){
   return res.status(400).send("Some Error occured while renaming");
  }
}

// Add user to group 
const addToGroup=async(req,res)=>{
    try{
        const {chatId,userId}=req.body;    
        const added= await Chat.findByIdAndUpdate(chatId,{
            $push:{users:userId},
        },{
            new:true
        }).populate("users","-password")
        .populate("groupAdmin","-password");
    
        if(added){
            return res.status(200).send(added);
        }else{
            return res.status(400).send("Failed to add user in group");
        }
    }
    catch(err){
       
        return res.status(400).send("Some error occured while adding user");
    }

}

const removeFromGroup=async(req,res)=>{
    try{
        const {chatId,userId}=req.body;

        const remove= await Chat.findByIdAndUpdate(chatId,{
            $pull:{users:userId},
        },{
            new:true
        }).populate("users","-password")
        .populate("groupAdmin","-password");
    
        if(remove){
            return res.status(200).send(remove);
        }else{
            return res.status(400).send("Failed to remove user from group");
        }
    }
    catch(err){
        return res.status(400).send("Some error occures while Removing user");
    }

}
module.exports={makeChats,fetchChats,createGroup,renameGroup,addToGroup,removeFromGroup};