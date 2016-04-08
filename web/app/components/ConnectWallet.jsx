import React from "react";
import NotificationActions from "actions/NotificationActions";
import ConnectStore from "stores/ConnectStore.js"
import ConnectActions from "actions/ConnectActions.js"

class ConnectWallet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        ConnectActions.connect("ws://localhost:8765");
    }

    componentDidMount() {
    }

    render() {


        let data = null;
        if (ConnectStore.isConnected()) {
            ConnectStore.getInfo().then( v => { data = v });
        }


//        NotificationActions.error('Test');
        return (
            <div className="grid-block vertical">
                <div className="grid-content">
                    <div className="content-block invoice">
                        <br/>
                        <h3>Connect</h3>
                        <p>{data}</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConnectWallet;
