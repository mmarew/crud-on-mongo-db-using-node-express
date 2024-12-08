const { MongoClient } = require("mongodb");
const mongoUri = "mongodb://localhost:27017"; // Replace with your MongoDB URI if not running locally
const client = new MongoClient(mongoUri);
client.connect();
module.exports = client;
