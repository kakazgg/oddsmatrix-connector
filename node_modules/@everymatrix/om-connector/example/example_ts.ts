import {
    Events,
    toggleDebugMode,
    onProcessExit,
    InitialData,
    UpdateData,
    SEPCPullConnector,
    SEPCPushConnector,
    pullListenTo,
    pushListenTo,
} from '@everymatrix/om-connector';

// SWITCH ON DEBUG MODE TO SEE MORE INFO
toggleDebugMode('true');

// //////////////
// PULL CONNECTOR
// //////////////
// extend connector class based on needed protocol

// TODO: fill in the below constants with the details provided by EveryMatrix
const FEED_ADDRESS = '';
const FEED_PULL_PORT = '';
const FEED_PUSH_PORT = '';
const SUBSCRIPTION_NAME = '';

if (!FEED_ADDRESS || !FEED_PULL_PORT || !FEED_PUSH_PORT || !SUBSCRIPTION_NAME) {
    throw new Error('Please provide the connection details.');
}

class MyPullConnector extends SEPCPullConnector {
    // provide appropriate host and port for constructor

    constructor(public host: string, public port: string) {
        super(host, port);
    }

    // override method responsible for notifying
    // about new initial data messages

    notifyInitialDump(initialData: InitialData) {
        // your own logic here
        console.log(initialData);
    }

    // override method responsible for notifying
    // about new update messages

    notifyEntityUpdates(updateData: UpdateData[]) {
        // your own logic here
        console.log(updateData);
    }
}

// create new instance of extended connector
// pass as arguments host and port
// NOTE: for SEPCPullConnector, the protocol type (e.g. 'http://', 'https://') is required

// replace host and port with proper ones
const pullConnector = new MyPullConnector(`http://${FEED_ADDRESS}`, FEED_PULL_PORT);
// optionally pass http request interval in ms; value must be between than 30000ms and 300000ms
pullConnector.start(SUBSCRIPTION_NAME);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
pushListenTo(Events.runtimeError, (error: string) => {
    // process different errors that could occur
});

// call stop() to close the connection and to avoid memory leaks
onProcessExit(pullConnector.stop);

// //////////////
// PUSH CONNECTOR
// //////////////

class MyPushConnector extends SEPCPushConnector {
    // provide appropriate host and port for constructor

    // variable where the last update batch uuid will be saved; use your own logic to save the latest processed update
    lastChangeBatchUuid: string;

    constructor(public host: string, public port: string) {
        super(host, port);
    }

    // override method responsible for notifying
    // about new initial data messages

    notifyInitialDump(initialData: InitialData) {
        // your own logic here
        console.log(initialData);
    }

    // override method responsible for notifying
    // about new update messages

    notifyEntityUpdates(updateData: UpdateData) {
        // example logic that stores the latest update batch uuid
        this.lastChangeBatchUuid = updateData.batchUuid;
        // your own logic here
        console.log(updateData);
    }

    getLastAppliedEntityChangeBatchUuid(): string {
        // return last saved uuid by any method
        return this.lastChangeBatchUuid;
    }
}

// create new instance of extended connector
// pass as arguments host and port
// NOTE: for SEPCPushConnector protocol must be absent

// replace host and port with proper ones
const pushConnector = new MyPushConnector(FEED_ADDRESS, FEED_PUSH_PORT);

// provide subscription name
// replace with proper subscriptionName
pushConnector.start(SUBSCRIPTION_NAME);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
pullListenTo(Events.runtimeError, (error: string) => {
    // process different errors that could occur
});

// call stop() to close the connection and to avoid memory leaks
onProcessExit(pushConnector.stop);
