const mongoose = require("mongoose");
let db_loacal = connect("mongodb://127.0.0.1:27017/entity");
let db_cluster = connect(
  "mongodb+srv://naeem:wHOBg9GyYb6ZzRzd@bfgdata.bj52u.mongodb.net/entity?retryWrites=true&w=majority"
);
const totalDoc = db_loacal.entities.countDocument();
console.log(totalDoc);
