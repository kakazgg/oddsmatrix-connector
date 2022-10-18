const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const entityRouter = require("./routes/entityRoutes");
dotenv.config();
const { connectToDb, getDB } = require("./config/db");

// db();
const app = express();
const server = http.createServer(app);
const { removeInitialData } = require("./controllers/entityControllers");

const io = new Server(server);
const port = process.env.PORT || 4000;
let db;
//Database connection
connectToDb((err) => {
  if (!err) {
    const { connector } = require("./config/connector");
    db = getDB();
    connector(db);
    server.listen(port, () => console.log(`Listening on port ${port}`));
  }
});
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
