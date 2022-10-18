const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

// module.exports = function () {
//   mongoose
//     .connect(process.env.MONGO_URI_LOCAL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => {
//       console.log("MongoDB connected! 😎");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
let dbConnection;
module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(process.env.MONGO_URI)
      .then((client) => {
        dbConnection = client.db();
        console.log("DB Connected");
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDB: () => dbConnection,
};
