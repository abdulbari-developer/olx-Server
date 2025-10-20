// import express from 'express'
// import authRoutes from './routes/authRoutes.js'
// import productRoutes from './routes/productRoutes.js'
// import getProducts from './routes/publicProductRoutes.js'
// import  client  from './config.js';
// import cookieParser  from 'cookie-parser'
// import dotenv from 'dotenv'
// import jwt from 'jsonwebtoken'
// import cors from "cors"
// dotenv.config();
// client.connect();
// console.log("You successfully connected to MongoDB!");
// const app = express()
// const port = 3003
// app.use(cors({
//   origin: 'https://olx-fe.vercel.app',
//   credentials: true,
//    methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }))
// app.use(cookieParser())
// app.use(express.json());


// app.use('/user',authRoutes) 
// app.use(getProducts) 

// app.use((req, res, next) => {
//   try{
//     let authToken = req.headers['authorization'].split(' ')[1];
//     let decoded = jwt.verify(authToken, process.env.SECRET);
//     next()
//   }catch(error){
//     return res.send({
//       status : 0,
//       error : error,
//       message : "Invalid Token"
//     })
//   }
  
// })


// app.use(productRoutes) 


// app.listen(port, () => {
//   console.log(`Example app listening on port ${ port }`)
// })
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import getProducts from './routes/publicProductRoutes.js'
import client from './config.js'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors from "cors"

dotenv.config();
client.connect();
console.log("You successfully connected to MongoDB!");

const app = express()
const port = 3003

app.use(cors({
  origin: 'https://olx-fe.vercel.app',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(cookieParser())
app.use(express.json())

// ✅ Public routes
app.use('/user', authRoutes)
app.use(getProducts)

// ✅ Token middleware – runs only for routes BELOW this line
app.use((req, res, next) => {
  try {
    const authToken = req.headers.authorization?.split(' ')[1];
    jwt.verify(authToken, process.env.SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      status: 0,
      message: "Invalid Token",
    });
  }
});

// ✅ Private routes
app.use(productRoutes)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
