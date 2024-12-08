const router = require("express").Router();
const client = require("./MongoConfig");

router.get("/", (req, res) => {
  res.send("Hello World!");
});
// Get all databases
router.get("/getAllDataBase", async (req, res) => {
  try {
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    res.json(databases);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// drop database
router.delete("/dropDatabase/:dbName", async (req, res) => {
  try {
    const db = client.db(req.params.dbName);
    await db.dropDatabase();
    res.json({ message: "Database dropped successfully" });
  } catch (error) {
    console.error("Error dropping database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create database
router.post("/createDatabase/:dbName", async (req, res) => {
  try {
    const dbName = req.params.dbName;
    const db = client.db(dbName);
    const collectionName = "defaultCollection";
    // Create a default collection and insert a dummy document (this creates the database)
    const collection = db.collection(collectionName);
    const result = await collection.insertOne({ createdAt: new Date() });

    res.json({ message: "Database created successfully" });
  } catch (error) {
    console.error("Error creating database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/updateDatabaseName/:oldName/:newName", async (req, res) => {
  try {
    const oldName = req.params.oldName;
    const newName = req.params.newName;

    // Connect to the old and new databases
    const oldDb = client.db(oldName);
    const newDb = client.db(newName);

    // Get all collections from the old database
    const collections = await oldDb.listCollections().toArray();

    // Copy all data from the old database to the new one
    for (const collection of collections) {
      const collectionName = collection.name;
      const oldCollection = oldDb.collection(collectionName);
      const newCollection = newDb.collection(collectionName);

      // Get all documents from the old collection
      const documents = await oldCollection.find({}).toArray();

      // Insert them into the new collection
      if (documents.length > 0) {
        await newCollection.insertMany(documents);
      }
    }

    // Drop the old database
    await oldDb.dropDatabase();

    res.json({
      message: `Database renamed from "${oldName}" to "${newName}" successfully`,
    });
  } catch (error) {
    console.error("Error updating database name:", error);
    res.status(500).json({ error: "Failed to rename database" });
  }
});

module.exports = router;
