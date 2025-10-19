
import express from 'express'
import client from '../config.js';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv'
const router = express.Router()
const myDB = client.db("Olx-clone");
const Products = myDB.collection("products");
const Favourites = myDB.collection("favourites");
import jwt from 'jsonwebtoken'



router.post('/product', async (req, res) => {
    let authToken = req.headers['authorization'].split(' ')[1];
  let decoded = jwt.verify(authToken, process.env.SECRET);
  console.log(decoded)
  const product = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    postedBy: decoded._id,
    status: true,
    deletedAt: null,
    isDeleted: false,
    productType: req.body.productType,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const response = await Products.insertOne(product)
  if (response) {
    return res.send({
      status: 1,
      message: "product added successfully"
    })
  }
  else {
    return res.send({
      status: 0,
      message: "something went wrong"
    })
  }
})

router.get('/myProducts', async (req, res) => { 
  let authToken = req.headers['authorization'].split(' ')[1];
  let decoded = jwt.verify(authToken, process.env.SECRET);
  const allProducts = Products.find({ postedBy: decoded._id, isDeleted: false, deletedAt: null })
  const response = await allProducts.toArray()
  console.log(response)
  if (response.length > 0) {
    return res.send(response)

  } else {

    return res.send({
      status: 0,
      message: 'No products found'
    })
  }
})

router.post('/product/:id', async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id)
    let authToken = req.headers['authorization'].split(' ')[1];
  let decoded = jwt.verify(authToken, process.env.SECRET);
    const product = await Products.findOne({ _id: productId, postedBy: decoded._id });
    if (!product) {
      return res.status(404).send({
        status: 0,
        message: "Product not found"
      })
    }
    const deleteProduct = await Products.updateOne({ _id: productId, postedBy: decoded._id }, { $set: { isDeleted: true, deletedAt: Date.now() } }, {})
    return res.status(200).send({
      status: 1,
      message: "Product Deleted"
    })
  } catch (error) {
    return res.status(500).send({
      status: 0,
      error: error,
      message: "internal server error"
    })
  }
})

router.put('/product/:id', async (req, res) => {
  // const query = {id : new ObjectId(req.params.id)}
  // const update = { title: req.body.title, description: req.body.description }
  const result = await Products.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: {  title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          category: req.body.category,
          productType: req.body.productType,
          updatedAt: Date.now(), } },
    {}
  )

  if (result) {
    return res.send({
      status: 1,
      message: 'product updated successfully'
    })
  } else {
    return res.send({
      status: 0,
      message: "something went wrong"
    })

  }
})

router.get('/product/:id', async (req, res) => {
  const product = await Products.findOne({ _id: new ObjectId(req.params.id), status: true, isDeleted: false, deletedAt: null })
  if (product) {
    return res.send(product)
  } else {
    return res.send({
      status: 0,
      message: 'product not found'
    })
  }
})

router.post('/favourite/:productId', async (req, res) => {
  try {
    // let decoded = jwt.verify(req.cookies.token, process.env.SECRET);
    let product = await Products.findOne({ _id: new ObjectId(req.params.productId), status: true, isDeleted: false, deletedAt: null })
    if (!product) {
      return res.status(404).send({
        status: 0,
        message: "product not found"
      })
    }
    let favourite = await Favourites.insertOne({
    //   userId: decoded._id,
      productId: req.params.productId
    })
    return res.status(200).send({
      status: 1,
      message: "added to favourite"
    })
  } catch (error) {
    return res.status(500).send({
      status: 0,
      error: error,
      message: "Internal Server Error"
    })
  }

})

// router.get('/cart/:userId', (request, res) => {
//   res.send('this is cart')
// })

// router.post('/checkout/:cartId', (request, res) => {
//   res.send('order placed succesfully')
// })

export default router;