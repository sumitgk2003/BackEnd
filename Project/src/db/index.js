import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB=async()=>{
  try{
    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MONGODB successfully connected!! DB HOST:${connectionInstance.connection.host}`);
    //console.log(connectionInstance.connection);
  }catch(error){
    console.log('error',error);
    //process.exit(1);
  }
}
// function connectDB(){
//   mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`).then((res)=>{
//     console.log(`MONGODB successfully connected!! DB HOST:${res.connection.host}`);
//   }).catch((error)=>{
//     console.log('error',error);
//   })
// }

export default connectDB;