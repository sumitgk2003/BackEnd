import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Subscription } from '../models/subscription.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken';
const generateAccessAndRefreshTokens=async(userId)=>{
  try {
    const user=await User.findById(userId);
    //console.log(user);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();

    //console.log(accessToken,refreshToken);
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});

    return {accessToken,refreshToken};
  
  } catch (error) {
    throw new ApiError(500,'Something went wrong while generating access and refresh tokens',error)
  }
}

const registerUser=asyncHandler(async(req,res)=>{
  const {username,email,password,fullName}=req.body;
  //console.log(email);

  if(
    [fullName,email,username,password].some((field)=>{
      if(!field)return true;
      if(field.trim()==='')return true;
      return false;
    })
  ){
    throw new ApiError(400,'All fields are required');
  }

  const existedUser=await User.findOne({
    $or:[{email},{username}]
  })
  if(existedUser){
    throw new ApiError(409,'User with username or email already exists');
  }
  if(Object.keys(req.files).length===0||!req.files.avatar)throw new ApiError(409,'Avatar is required');
  
  let avatarPath=req.files.avatar[0].path;
  avatarPath=await uploadOnCloudinary(avatarPath);
  //console.log(avatarPath);
  let coverImagePath='';
  if(req.files.coverImage){
    coverImagePath=req.files.coverImage[0].path;
    coverImagePath=await uploadOnCloudinary(coverImagePath);
  }
  
  //console.log(avatarPath,coverImagePath);

  const user=await User.create({
    username,
    password,
    fullName,
    email,
    avatar:avatarPath.url,
    coverImage:coverImagePath?coverImagePath.url:''
  })

  const createdUser=await User.findById(user._id).select('-password -refreshToken')

  console.log(createdUser);
  if(!createdUser){
    throw new ApiError(500,'Something went wrong while registering the user')
  }

    res.status(201).json(
      new ApiResponse(200,createdUser,'User registered Successfully')
    )
})

const loginUser=asyncHandler(async(req,res)=>{
  const {username,email,password}=req.body;
  console.log(username,email,password);
  if(!username && !email){
    throw new ApiError(400,'Enter email or password');
  }
  const user=await User.findOne({
    $or:[{username:username},{email:email}]
  })
  if(!user){
    throw new ApiError(400,'User does not exist')
  }
  //console.log(user);
  if(!password){
    throw new ApiError(400,'Enter password')
  }
  const isPasswordCorrect=await user.isPasswordCorrect(password);
  if(!isPasswordCorrect){
    throw new ApiError(400,'Invalid Password');
  }

  const{refreshToken,accessToken}=await generateAccessAndRefreshTokens(user._id);
  //console.log(accessToken,refreshToken)
  const loggedInUser=await User.findById(user._id);
  const options={
    httpOnly:true,
    secure:true
  }

  res.status(200)
  .cookie('accessToken',accessToken,options)
  .cookie('refreshToken',refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggedInUser,
        accessToken,
        refreshToken
      },
      'User logged in successfully'
    )
  )

})

const logoutUser=asyncHandler(async(req,res)=>{
  const user=await User.findByIdAndUpdate (req.user._id,{
    $unset:{
      refreshToken:1
    }
  },
  {
    new:true
  }
);

  //console.log(user);
  const options={
    httpOnly:true,
    secure:true
  }
  res.status(200)
  .clearCookie('accessToken',options)
  .clearCookie('refreshToken',options)
  .json(
    new ApiResponse(200,{},'User logged out successfully')
  )

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken;
  console.log(incomingRefreshToken,!incomingRefreshToken,req.cookies)
  if(!incomingRefreshToken){
    throw new ApiError(400,'Unauthorized request')
  }
  try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user=await User.findById(decodedToken._id)
    if(!user){
      throw new ApiError(400,'User not found')
    }
    if(!user.refreshToken && incomingRefreshToken!==user.refreshToken){
      throw new ApiError(400,'Refresh token expired')
    }
    
    const {refreshToken,accessToken}=await generateAccessAndRefreshTokens(user._id);
    //console.log(refreshToken,accessToken);
    user.refreshToken=refreshToken;
  
    user.save({validateBeforeSave:false});
  
    const options={
      httpOnly:true,
      secure:true
    }
    res.status(200).cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options).json(
      new ApiResponse(200,{user,refreshToken,accessToken},'Access Token refreshed successfully')
    )
  
  } catch (error) {
    throw new ApiError(401,error||'Invalid refresh Token')
  }
})

const subscribe=asyncHandler(async(req,res)=>{
  const {username}=req.body;
  const channel =await User.findOne({username});
  console.log(channel);
  const subscription=await Subscription.create({
    channel:channel._id,
    subscriber:req.user._id
  })
  return res.status(200).json(
    new ApiResponse(200,subscription,'user subscribed successfully')
  )
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
  const {username}=req.params;
  console.log(username);
  if(!username?.trim()){
    throw new ApiError(400,'username is missing');
    }
  const channel= await User.aggregate([
      {
        $match:{
          username:username.toLowerCase()
        }
      },
      {
        $lookup:{
          from:'subscriptions',
          localField:'_id',
          foreignField:'channel',
          as:'subscribers'
        }
      },
      {
        $lookup:{
          from:'subscriptions',
          localField:'_id',
          foreignField:'subscriber',
          as:'subscribedTo'
        }
      },
      {
        $addFields:{
          subscribersCount:{
            $size:'$subscribers'
          },
          channelsSubscribedToCount:{
            $size:'$subscribedTo'
          },
          isSubscribed:{
            $cond:{
              if:{$in:[req.user._id,'$subscribers.subscriber']},
              then:true,
              else:false
            }
          }
        }
      },
      {
        $project:{
          username:1,
          fullname:1,
          subscribersCount:1,
          channelsSubscribedToCount:1,
          isSubscribed:1,
          avatar:1,
          coverImage:1,
          email:1
        }
      }
  ])
  console.log(channel);
  if(!channel?.length){
    throw new ApiError(404,'channel does not exists')
  }

  return res.status(200).json(
    new ApiResponse(200,channel,'user channel fetched successfully')
  )
})
export {registerUser,loginUser,logoutUser,refreshAccessToken,getUserChannelProfile,subscribe};