const express = require("express");
const app = express();
const databaseRouter = require("./Database");
app.use(databaseRouter);
const collectionsRouter = require("./Collections");
app.use(collectionsRouter);
const documentRouter = require("./Document");
app.use(documentRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
