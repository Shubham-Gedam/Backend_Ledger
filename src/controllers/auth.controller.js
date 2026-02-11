import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function registerController(req, res) {
  const { email, password, name } = req.body;

  const isExsts = await userModel.findOne({ email: email });

  if (isExsts) {
    return res.status(422).json({
      message: "Email already exists, please use a different email address",
      status: "failed",
    });
  }

  const user = await userModel.create({
    email,
    password,
    name,
  });
  const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET)

  res.cookie("token", token)
  
  res.status(201).json({
    user:{
        _id: user._id,
        email: user.email,
        name: user.name,
    },
    token: token,
     message: "User registered successfully",
     status: "success",
  })


}

export async function loginController(req,res){
    const {email, password} = req.body;

    const user = await userModel.findOne({email: email}).select("+password");

    if(!user){
        return res.status(404).json({
            message: "User not found, please register first",
            status: "failed",
        })
    }
    
    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid){
        return res.status(401).json({
            message: "Invalid password",
            status: "failed",
        })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(200).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name,
        },
        token: token,
         message: "User logged in successfully",
         status: "success",
      })
}