const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

main().catch((err) => console.log(err));

await mongoose.connect("mongodb://localhost:27017/bfg", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log('MongoDB connected...')
})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/bfg", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected ...");
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

var io = socketIo(server);
// console.log('io =-=-=-=-', io);
let interval;
interval = setInterval(() => getApiAndEmit(io), 1000);

io.sockets.on('connection', function(socket){
    console.log("new client connected");
});
// io.on("connection", (socket) => {
//   console.log("New client connected");
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(() => getApiAndEmit(socket), 1000);
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     clearInterval(interval);
//   });
// });

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  console.log('// Emitting a new message. Will be consumed by the client =-=--=');
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));