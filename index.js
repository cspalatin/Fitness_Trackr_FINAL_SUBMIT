// create the express server here
require("dotenv").config();

const { PORT = 3000 } = process.env;

const express = require("express");
const server = express();

const cors = require("cors");
server.use(cors());

const morgan = require("morgan");
server.use(morgan("dev"));

const bodyParser = require("body-parser");
server.use(bodyParser.json());

const client = require("./db/client.js");

const apiRouter = require("./api");
server.use("/api", apiRouter);

server.get("*", (req, res, next) => {
  res.status(404);
  res.send({
    error: "route not found",
    message: "route not found here either",
  });
});

server.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send(error);
});

server.listen(PORT, () => {
  client.connect();
  console.log("The server is up on port", PORT);
});
