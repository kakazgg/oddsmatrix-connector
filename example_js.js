const mongoose = require("mongoose");
const Schema = mongoose.Schema;

main().catch((err) => console.log(err));
// local mongoos
//mongodb://localhost:27017/bfg

async function main() {
  await mongoose.connect(
    "mongodb+srv://naeem:wHOBg9GyYb6ZzRzd@bfgdata.bj52u.mongodb.net/bfg?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  console.log("connected ...");
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
var entitySchema = new Schema({}, { strict: false });
var Entity = mongoose.model("Entity", entitySchema);

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

// //////////////
// PUSH CONNECTOR
// //////////////

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
    const entity = initialData.entities[0].entityClass;
    var Entity = mongoose.model(entity, entitySchema);
    console.log(entity);
    Entity.insertMany(initialData.entities)
      .then(function () {
        console.log("Data inserted"); // Success
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
  }

  // override method responsible for notifying
  // about new update messages
  notifyEntityUpdates(updateData) {
    console.log("this is the update data", updateData);
  }

  // return the last saved uuid as you see fit, in order to avoid re-subscription
  getLastAppliedEntityChangeBatchUuid() {
    return this.lastChangeBatchUuid;
  }
}
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
