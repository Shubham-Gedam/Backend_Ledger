import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";


export async function authMiddleware(req, res, next){

    const token =  req.cookies.token || req.header.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message: "Unauthorized: No token provided."});
    }

    try {
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("-password");

        req.user = user;

        return next();
        
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid "
        })
    }
}

export async function authSystemUserMiddleware(req, res, next){
    
    const token = req.cookies.token || req.header.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Unauthorized: No token provided."
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden: Access is allowed only for system users."
            })
        }

        req.user = user;

        return next();

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}