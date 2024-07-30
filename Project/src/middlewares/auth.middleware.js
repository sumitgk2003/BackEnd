import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const verifyJwt=asyncHandler(async(req,res,next)=>{
  const accessToken=req.cookies.accessToken;
  console.log(accessToken);
  if(!accessToken){
    throw new ApiError(400,'Access token not found');
  }
  const decodedToken=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
  
  console.log(decodedToken);

  const user=await User.findById(decodedToken._id).select('-password -refreshToken');

  if(!user){
    throw new ApiError(400,'Invalid Access Token');
  }
  req.user=user;
  console.log(user);
  next();
  
})

