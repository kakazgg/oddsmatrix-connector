const { MongoClient } = require("mongodb");
const http = require("http");
const server = http.createServer((req, res) => {
  console.log("hello");
});
const port = process.env.PORT || 4000;
const {
  onProcessExit,
  pullListenTo,
  pushListenTo,
  Events,
  toggleDebugMode,
  SEPCPullConnector,
  SEPCPushConnector,
} = require("@everymatrix/om-connector");

// SWITCH ON DEBUG MODE TO SEE MORE INFO
toggleDebugMode(true);
let db;
let countInserted = 1;
const batches = [];
let isProcessing = false;
// //////////////
// PUSH CONNECTOR
// //////////////

const insertIntoDB = () => {
  if (!batches.length) {
    isProcessing = false;
    return;
  }
  const collectionName = batches[0][0]?.entityClass;
  //db.collection(collectionName).createIndex({ entityClass: 1, id: 1 });
  db.collection(collectionName)
    .bulkWrite(
      batches[0].map((doc) => ({
        insertOne: {
          document: doc,
        },
      }))
    )
    .then(() => {
      console.log(`Data Inserted ${countInserted}`);
      countInserted++;
      batches.splice(0, 1);
      insertIntoDB();
    })
    .catch((err) => {
      console.log(err.message);
    });
};

class MyPushConnector extends SEPCPushConnector {
  // constructor(url, port) {
  //   super(url, port);
  // }
  // variable where the last update batch uuid will be saved; use your own logic to save the latest processed update
  lastChangeBatchUuid = null;

  // override method responsible for notifying
  // about new initial data messages
  notifyInitialDump(initialData) {
    //console.log("data", initialData);
    console.log(
      "initialData =-=-=-=-=-=",
      initialData.batchId,
      "batchleft",
      initialData.batchesLeft
    );

    batches.push(initialData.entities);
    if (!isProcessing) {
      isProcessing = true;
      insertIntoDB();
    }
  }

  // override method responsible for notifying
  // about new update messages
  notifyEntityUpdates(updateData) {
    console.log("Update data length==", updateData.changes.length);
    updateData.changes.map((change) => {
      if (change?.type === "update") {
        db.collection(change?.entityClass)
          .findOneAndUpdate(
            { id: change?.id, entityClass: change.entityClass },
            change
          )
          .then(() => {
            console.log("data update");
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (change?.type === "delete") {
        db.collection(change?.entityClass)
          .findOneAndDelete({ id: change?.id, entityClass: change.entityClass })
          .then(() => {
            console.log("data Deleted");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }

  // return the last saved uuid as you see fit, in order to avoid re-subscription
  getLastAppliedEntityChangeBatchUuid() {
    return this.lastChangeBatchUuid;
  }
}
const connector = () => {
  // const thing = new Thing({ iAmNotInTheSchema: true });
  // thing.save(); // iAmNotInTheSchema is not saved to the db

  // create new instance of extended connector
  // pass as arguments host and port
  // NOTE: for SEPCPushConnector protocol must be absent

  // replace host and port with proper ones
  const pushConnector = new MyPushConnector("sept.oddsmatrix.com", 7000);

  // provide subscription name
  // replace with proper subscriptionName
  pushConnector.start("LawleyandAllen");

  pushListenTo(Events.runtimeError, (error) => {
    // process different errors that could occur
  });

  // call stop() to close the connection and to avoid memory leaks
  onProcessExit(pushConnector.stop);
};

MongoClient.connect(
  "mongodb+srv://naeem:wHOBg9GyYb6ZzRzd@bfgdata.bj52u.mongodb.net/entity_2?retryWrites=true&w=majority"
)
  .then(async (client) => {
    db = client.db();
    console.log("DB connected");

    server.listen(port, () => {
      console.log("App is running");
    });
    connector();
  })
  .catch((err) => {
    console.log(err);
  });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`app is running on port ${PORT}`);
// });
