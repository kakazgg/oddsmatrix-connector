const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const entityRouter = require("./routes/entityRoutes");
dotenv.config();
const db = require("./config/db");
//const { connector } = require("./config/connector");
const app = express();
const server = http.createServer(app);

const io = new Server(server);
const port = process.env.PORT || 4000;
//Database connection
db();
//connector();
// cors
app.use(cors());
// remove old data
// (async () => {
//   await removeInitialData();
// })();

global.io = io;
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

server.listen(port, () => {
  console.log("App is listen on port ", port);
});
