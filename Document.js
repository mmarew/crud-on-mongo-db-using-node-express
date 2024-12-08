const express = require("express");
const router = express.Router();
const client = require("./MongoConfig"); // Ensure this exports a connected MongoClient instance
const { ObjectId } = require("mongodb");

// Create a new document
router.post("/Document/:databaseName/:collectionName", async (req, res) => {
  try {
    const { databaseName, collectionName } = req.params;
    const document = req.body;
    console.log("document", document);
    if (!databaseName || !collectionName) {
      return res
        .status(400)
        .json({ error: "Database and collection names are required." });
    }

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const result = await collection.insertMany(document);

    res.status(201).json(result.ops[0]);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Read all documents
router.get("/Document/:databaseName/:collectionName", async (req, res) => {
  try {
    const { databaseName, collectionName } = req.params;

    if (!databaseName || !collectionName) {
      return res
        .status(400)
        .json({ error: "Database and collection names are required." });
    }

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error reading documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Read a single document by ID
router.get("/Document/:databaseName/:collectionName/:id", async (req, res) => {
  try {
    const { databaseName, collectionName, id } = req.params;

    if (!databaseName || !collectionName || !id) {
      return res.status(400).json({
        error: "Database name, collection name, and document ID are required.",
      });
    }

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const document = await collection.findOne({ _id: new ObjectId(id) });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Error reading document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a document by ID
router.put("/Document/:databaseName/:collectionName/:id", async (req, res) => {
  try {
    const { databaseName, collectionName, id } = req.params;
    const update = req.body;

    if (!databaseName || !collectionName || !id) {
      return res.status(400).json({
        error: "Database name, collection name, and document ID are required.",
      });
    }

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({ message: "Document updated successfully" });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a document by ID
router.delete(
  "/Document/:databaseName/:collectionName/:id",
  async (req, res) => {
    try {
      const { databaseName, collectionName, id } = req.params;

      if (!databaseName || !collectionName || !id) {
        return res.status(400).json({
          error:
            "Database name, collection name, and document ID are required.",
        });
      }

      const db = client.db(databaseName);
      const collection = db.collection(collectionName);
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
