
 import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://abdulbari4900_db_user:_db_user@cluster0.isbv8ln.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// async function run() {
//    return await client.connect();
// }
// run();
export default client