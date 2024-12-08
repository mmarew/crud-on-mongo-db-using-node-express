const express = require("express");
const router = express.Router();
const client = require("./MongoConfig"); // MongoDB client configuration

// Create a collection
router.post(
  "/createCollection/:databaseName/:collectionName",
  async (req, res) => {
    try {
      const { databaseName, collectionName } = req.params;

      if (!databaseName || !collectionName) {
        return res
          .status(400)
          .json({ error: "Database name and collection name are required" });
      }

      const db = client.db(databaseName);
      const collection = await db.createCollection(collectionName);
      const insertedData = await collection.insertOne({
        createdAt: new Date(),
      });

      res.json({
        message: `Collection '${collection.collectionName}' created successfully.`,
      });
    } catch (error) {
      console.error("Error creating collection:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updateCollectionName/:databaseName/:oldCollectionName/:newCollectionName",
  async (req, res) => {
    try {
      const databaseName = req.params?.databaseName;
      const oldCollectionName = req.params?.oldCollectionName,
        newCollectionName = req.params?.newCollectionName;

      if (!databaseName || !oldCollectionName || !newCollectionName) {
        return res.status(400).json({
          error:
            "Database name, old collection name, and new collection name are required",
        });
      }

      const db = client.db(databaseName);
      // Rename the collection
      await db.renameCollection(oldCollectionName, newCollectionName);

      res.json({
        message: `Collection '${oldCollectionName}' successfully renamed to '${newCollectionName}'.`,
      });
    } catch (error) {
      console.error("Error renaming collection:", error);
      if (error.codeName === "NamespaceNotFound") {
        res
          .status(404)
          .json({ error: `Collection '${oldCollectionName}' not found.` });
      } else if (error.codeName === "NamespaceExists") {
        res
          .status(400)
          .json({ error: `Collection '${newCollectionName}' already exists.` });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
);

// Drop a collection
router.delete(
  "/dropCollection/:databaseName/:collectionName",
  async (req, res) => {
    try {
      const { databaseName, collectionName } = req.params;

      if (!databaseName || !collectionName) {
        return res
          .status(400)
          .json({ error: "Database name and collection name are required" });
      }

      const db = client.db(databaseName);
      await db.collection(collectionName).drop();

      res.json({
        message: `Collection '${collectionName}' dropped successfully.`,
      });
    } catch (error) {
      console.error("Error dropping collection:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get all collections in a database
router.get("/listCollections/:databaseName", async (req, res) => {
  try {
    const { databaseName } = req.params;

    if (!databaseName) {
      return res.status(400).json({ error: "Database name is required" });
    }

    const db = client.db(databaseName);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    res.json({ collections: collectionNames });
  } catch (error) {
    console.error("Error listing collections:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// get single collection
router.get(
  "/getSingleCollection/:databaseName/:collectionName",
  async (req, res) => {
    try {
      const { databaseName, collectionName } = req.params;

      if (!databaseName || !collectionName) {
        return res
          .status(400)
          .json({ error: "Database name and collection name are required" });
      }

      const db = client.db(databaseName);
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      res.json({ documents });
    } catch (error) {
      console.error("Error getting collection:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
