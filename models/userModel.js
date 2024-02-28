const mongoose=require('mongoose');

const userModel=mongoose.Schema(
    {
       name:{type:String,required:true},
       email:{type:String,required:true,unique:true},
       password:{type:String,required:true},
       pic:{type:String,
            default:"https://t3.ftcdn.net/jpg/05/53/79/60/360_F_553796090_XHrE6R9jwmBJUMo9HKl41hyHJ5gqt9oz.jpg"
        },
    },{
        timestamps:true,
    }
);

const User=mongoose.model("User",userModel);
module.exports=User;