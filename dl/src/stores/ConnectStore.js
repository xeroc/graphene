var alt = require("../alt-instance");
var WebSocketRpc = require("rpc_api/WebSocketRpc");
var ConnectActions = require('actions/ConnectActions');

class ConnectionStore {

    constructor() {
        this.errorMessage = null;
        this.ws_rpc = null;

        this.bindListeners({
            connect: ConnectActions.CONNECT,
//            getInfo: ConnectActions.GETINFO,
        });

        this.exportPublicMethods({
            connect: this.connect,
            getInfo: this.getInfo,
            exec: this.exec,
            isConnected: this.isConnected,
        });
    }

    connect(connection_string) {
        if (this.ws_rpc) return; // already connected
        // let connection_string = "ws://localhost:8765";
        console.log(`connecting to ${connection_string}`);
        this.ws_rpc = new WebSocketRpc(connection_string, this.null);
        return this.ws_rpc;
    }

    isConnected() {
        return this.ws_rpc;
    }

    exec(method, params) {
        return this.ws_rpc.connect_promise.then(() => {
            return this.ws_rpc.call([1, method, params])
                .catch(error => {
                    console.log("!!! ConnectInstaces error: ", method, params, error);
                    throw error;
                })
        });
    }

    close() {
        this.ws_rpc.close();
        this.ws_rpc = null
    }

    getInfo() {
        return this.exec("info", []);
    }

}

module.exports = alt.createStore(ConnectionStore, 'ConnectionStore');
