const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const entityRouter = require("./routes/entityRoutes");
dotenv.config();
const db = require("./config/db");
require("./config/connector");
db();
const app = express();
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(socket.id);
});

app.use("/entities", entityRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "Not found",
    data: {
      message: "Route could not found",
    },
  });
});

const port = process.env.PORT || 9000;
server.listen(port, () => console.log(`Listening on port ${port}`));