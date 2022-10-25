const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const entityRouter = require("./routes/entityRoutes");
const globalRouter = require("./routes/globalRoutes");
dotenv.config();
const { connectToDb, getDB } = require("./config/db");
//const { connector } = require("./config/connector");
const app = express();
const server = http.createServer(app);

const io = new Server(server);
const port = process.env.PORT || 4000;

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
app.use("/global", globalRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "Not found",
    data: {
      message: "Route could not found",
    },
  });
});

//Database connection
connectToDb((err) => {
  if (!err) {
    global.db = getDB();
    server.listen(port, () => {
      console.log("App is listen on port ", port);
    });
  }
});
