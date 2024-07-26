import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const PORT=process.env.PORT;
const app=express();

app.get('/api/jokes',(req,res)=>{
  const jokes=[
    {
      id:1,
      title:'first joke',
      content:'This is a first joke'
    },
    {
      id:2,
      title:'another joke',
      content:'This is a another joke'
    },
    {
      id:3,
      title:'third joke',
      content:'This is a third joke'
    },
    {
      id:4,
      title:'fourth joke',
      content:'This is a fourth joke'
    },
    {
      id:5,
      title:'fifth joke',
      content:'This is a fifth joke'
    }
  ];
  res.send(jokes);
})

app.listen(PORT,()=>{
  console.log(`App is listening on port: ${PORT}`);
})