import express from 'express'
import client from '../config.js';
const myDB = client.db("Olx-clone");
const Products = myDB.collection("products");
const router = express.Router()


router.get('/getproducts', async (req, res) => {
  const allProducts = Products.find({ status: true, isDeleted: false, deletedAt: null })
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
export default router;