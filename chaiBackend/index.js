require('dotenv').config();

const express=require('express');

const app=express();

const data={
  "login": "sumitgk2003",
  "id": 97029911,
  "node_id": "U_kgDOBciPFw",
  "avatar_url": "https://avatars.githubusercontent.com/u/97029911?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/sumitgk2003",
  "html_url": "https://github.com/sumitgk2003",
  "followers_url": "https://api.github.com/users/sumitgk2003/followers",
  "following_url": "https://api.github.com/users/sumitgk2003/following{/other_user}",
  "gists_url": "https://api.github.com/users/sumitgk2003/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/sumitgk2003/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/sumitgk2003/subscriptions",
  "organizations_url": "https://api.github.com/users/sumitgk2003/orgs",
  "repos_url": "https://api.github.com/users/sumitgk2003/repos",
  "events_url": "https://api.github.com/users/sumitgk2003/events{/privacy}",
  "received_events_url": "https://api.github.com/users/sumitgk2003/received_events",
  "type": "User",
  "site_admin": false,
  "name": null,
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 0,
  "public_gists": 0,
  "followers": 0,
  "following": 0,
  "created_at": "2022-01-03T11:52:27Z",
  "updated_at": "2024-07-09T10:35:27Z"
}

app.get('/',(req,res)=>{
  res.send("Hello World");
})

app.get('/login',(req,res)=>{
  res.send('<h1>Login</h1>');
})

app.get('/github',(req,res)=>{
  res.json(data);
})

app.listen(process.env.PORT,()=>{
  console.log(`The app is listening on port ${process.env.PORT}`)
})