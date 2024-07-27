import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './db/index.js';

const app=express(); 
connectDB().then(()=>{
  app.listen(process.env.PORT,()=>{
    console.log(`App is listening on port:${process.env.PORT}`)
  })
}).catch((error)=>{
  console.log("MongoDB connection failed",error);
});







//const app=express();
// (async()=>{
//   try{
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on('error',(error)=>{
//       console.log('error',error);
//       throw error;
//     })
//     app.listen(process.env.PORT,()=>{
//       console.log(`App is listening on port ${process.env.PORT}`);
//     })
//   }catch(error){
//     console.log('error',error);
//   }
// })()
