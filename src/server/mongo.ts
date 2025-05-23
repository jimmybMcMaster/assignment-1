import { MongoClient } from "mongodb";

const uri = "mongodb://mongo:27017";
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    return client.db("bookstore");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export default connectToMongo;
