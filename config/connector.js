const {
  onProcessExit,
  pullListenTo,
  pushListenTo,
  Events,
  toggleDebugMode,
  SEPCPullConnector,
  SEPCPushConnector,
} = require("@everymatrix/om-connector");
const {
  initializeEntities,
  updateInitializeEntities,
  removeInitialData,
} = require("../controllers/entityControllers");

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
  async notifyInitialDump(initialData) {
    console.log(
      "initialData =-=-=-=-=-=",
      initialData.batchId,
      "batchleft",
      initialData.batchesLeft
    );

    // insert all the initial data
    await initializeEntities(initialData.entities);
    console.log("Data Initialized");
  }

  // override method responsible for notifying
  // about new update messages
  async notifyEntityUpdates(updateData) {
    //console.log("this is the update data", updateData);
    await updateInitializeEntities(updateData.changes);
    io.emit("update", updateData.changes);
    console.log("Data updated");
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
pushListenTo(Events.ConnectorExit, () => {
  // pushConnector stopped here
  pushConnector.stop();
});

// call stop() to close the connection and to avoid memory leaks
onProcessExit(pushConnector.stop);
