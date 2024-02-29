const express=require('express');
const app=express();
const connectDB=require('./config/db'); 
const dotenv=require('dotenv');
const cors=require("cors");
const path=require('path')
const userRoutes=require('./routes/userRoutes');
const chatRoutes=require('./routes/chatRoutes');
const messageRoutes=require('./routes/messageRoutes');

dotenv.config();

//databse config
connectDB();

app.use(cors());

const port=process.env.PORT;

app.use(express.json());

app.use(express.static(path.join(__dirname,'./client/build')))

app.use('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html'));
})

// User Authentication 
app.use('/api/user',userRoutes);
app.use('/api/chats',chatRoutes);
app.use('/api/message',messageRoutes);

app.use((req,res,next)=>{
  const error=new Error(`not found - ${req.originalUrl}`);
  res.status(400);
  next(error);
})

const server=app.listen(port,(err)=>{                                                              /*Listener to localhost */ 
    if(err){
        console.log('Error in running the server');
    }
    console.log(`Exress server is runnning at http://localhost:${port}`);
})

const io=require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
      origin:"http://localhost:3000",
    }
});

io.on("connection",(socket)=>{


  socket.on("setup",(userData)=>{
    // creating a separate room for the user 
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat",(room)=>{
    socket.join(room);

  });

  
  socket.on("typing",(room)=> socket.in(room).emit("typing"));
  socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"));

  socket.on("new message",(newMessageRecieved)=>{
    // console.log(newMessageRecieved);
    var chat=newMessageRecieved.chat;
    if(!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach(user => {
        if(user._id==newMessageRecieved.sender._id){
          return;
        }
        socket.in(user._id).emit("message recieved",newMessageRecieved);

    });
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});


