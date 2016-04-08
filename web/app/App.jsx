import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, Redirect} from "react-router";
import IntlStore from "stores/IntlStore"; // This needs to be initalized here even though IntlStore is never used
import Apis from "rpc_api/ApiInstances";
import DashboardContainer from "./components/Dashboard/DashboardContainer";
import Explorer from "./components/Explorer/Explorer";
import Blocks from "./components/Explorer/BlocksContainer";
import Assets from "./components/Explorer/AssetsContainer";
import AccountsContainer from "./components/Explorer/AccountsContainer";
import Witnesses from "./components/Explorer/Witnesses";
import CommitteeMembers from "./components/Explorer/CommitteeMembers";
import Header from "components/Layout/Header";
import Footer from "./components/Layout/Footer";
import AccountPage from "./components/Account/AccountPage";
import AccountOverview from "./components/Account/AccountOverview";
import AccountAssets from "./components/Account/AccountAssets";
import AccountAssetCreate from "./components/Account/AccountAssetCreate";
import AccountAssetUpdate from "./components/Account/AccountAssetUpdate";
import AccountMembership from "./components/Account/AccountMembership";
import AccountVesting from "./components/Account/AccountVesting";
import AccountDepositWithdraw from "./components/Account/AccountDepositWithdraw";
import AccountPermissions from "./components/Account/AccountPermissions";
import AccountWhitelist from "./components/Account/AccountWhitelist";
import AccountVoting from "./components/Account/AccountVoting";
import AccountOrders from "./components/Account/AccountOrders";
import Exchange from "./components/Exchange/ExchangeContainer";
import Markets from "./components/Exchange/MarketsContainer";
import Transfer from "./components/Transfer/Transfer";
import Settings from "./components/Settings/SettingsContainer";
import FeesContainer from "./components/Blockchain/FeesContainer";
import BlockContainer from "./components/Blockchain/BlockContainer";
import AssetContainer from "./components/Blockchain/AssetContainer";
import Transaction from "./components/Blockchain/Transaction";
import CreateAccount from "./components/Account/CreateAccount";
import AccountStore from "stores/AccountStore";
import SettingsStore from "stores/SettingsStore";
import IntlActions from "actions/IntlActions";
import MobileMenu from "components/Layout/MobileMenu";
import LoadingIndicator from "./components/LoadingIndicator";
import TransactionConfirm from "./components/Blockchain/TransactionConfirm";
import WalletUnlockModal from "./components/Wallet/WalletUnlockModal"
import NotificationSystem from "react-notification-system";
import NotificationStore from "stores/NotificationStore";
import iDB from "idb-instance";
import ExistingAccount, {ExistingAccountOptions} from "./components/Wallet/ExistingAccount";
import WalletCreate from "./components/Wallet/WalletCreate";
import ImportKeys from "./components/Wallet/ImportKeys";
import WalletDb from "stores/WalletDb";
import PrivateKeyActions from "actions/PrivateKeyActions";
import Console from "./components/Console/Console";
import ReactTooltip from "react-tooltip";
import Invoice from "./components/Transfer/Invoice";
import ConnectWallet from "./components/ConnectWallet";
import ChainStore from "api/ChainStore";
import {BackupCreate, BackupVerify, BackupRestore} from "./components/Wallet/Backup";
import WalletChangePassword from "./components/Wallet/WalletChangePassword"
import WalletManagerStore from "stores/WalletManagerStore";
import WalletManager, {WalletOptions, ChangeActiveWallet, WalletDelete} from "./components/Wallet/WalletManager";
import BalanceClaimActive from "./components/Wallet/BalanceClaimActive";
import BackupBrainkey from "./components/Wallet/BackupBrainkey";
import Brainkey from "./components/Wallet/Brainkey";
import AccountRefsStore from "stores/AccountRefsStore";
import Help from "./components/Help";
import InitError from "./components/InitError";
import BrowserSupportModal from "./components/Modal/BrowserSupportModal";
import createBrowserHistory from 'history/lib/createHashHistory';
import {IntlProvider} from "react-intl";
import intlData from "./components/Utility/intlData";
import connectToStores from "alt/utils/connectToStores";

require("./components/Utility/Prototypes"); // Adds a .equals method to Array for use in shouldComponentUpdate
require("./assets/stylesheets/app.scss");
require("dl_cli_index").init(window) // Adds some object refs to the global window object

let history = createBrowserHistory({queryKey: false})

class App extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            synced: false,
            theme: SettingsStore.getState().settings.get("themes")};
    }

    componentWillUnmount() {
        NotificationStore.unlisten(this._onNotificationChange);
        SettingsStore.unlisten(this._onSettingsChange);
    }

    componentDidMount() { 
        try {
            NotificationStore.listen(this._onNotificationChange.bind(this));
            SettingsStore.listen(this._onSettingsChange.bind(this));

            Promise.all([
                AccountStore.loadDbData()            
            ]).then(() => {
                AccountStore.tryToSetCurrentAccount();
                this.setState({loading: false});
            }).catch(error => {
                console.log("[App.jsx] ----- ERROR ----->", error, error.stack);
                this.setState({loading: false});
            });

            ChainStore.init().then(() => {
                this.setState({synced: true});
            }).catch(error => {
                console.log("[App.jsx] ----- ChainStore.init error ----->", error, error.stack);
                this.setState({loading: false});
            });
        } catch(e) {
            console.error(e);
        }
        const user_agent = navigator.userAgent.toLowerCase();
        if (!(window.electron || user_agent.indexOf("firefox") > -1 || user_agent.indexOf("chrome") > -1 || user_agent.indexOf("edge") > -1)) {
            this.refs.browser_modal.show();
        }

        this.props.history.listen(() => {
            this._rebuildTooltips();
        });

        this._rebuildTooltips();
    }

    _rebuildTooltips() {
        if (this.refs.tooltip) {
            this.refs.tooltip.globalRebuild();
        }
    }

    /** Usage: NotificationActions.[success,error,warning,info] */
    _onNotificationChange() {
        let notification = NotificationStore.getState().notification;
        if (notification.autoDismiss === void 0) {
            notification.autoDismiss = 10;
        }
        if (this.refs.notificationSystem) this.refs.notificationSystem.addNotification(notification);
    }

    _onSettingsChange() {
        let {settings} = SettingsStore.getState();
        if (settings.get("themes") !== this.state.theme) {
            this.setState({
                theme: settings.get("themes")
            });
        }
    }



    // /** Non-static, used by passing notificationSystem via react Component refs */
    // _addNotification(params) {
    //     console.log("add notification:", this.refs, params);
    //     this.refs.notificationSystem.addNotification(params);
    // }

    render() {
       
        let content = null;

        if (this.state.loading) {
            content = <div className="grid-frame vertical"><LoadingIndicator /></div>;
        } else if (this.props.location.pathname === "/init-error") {
            content = <div className="grid-frame vertical">{this.props.children}</div>
        } else {
            content = (
                <div className="grid-frame vertical">
                    <Header/>
                    <MobileMenu isUnlocked={this.state.isUnlocked} id="mobile-menu"/>
                    <div className="grid-block vertical">
                        {this.props.children}
                    </div>
                    <Footer synced={this.state.synced}/>
                    <ReactTooltip ref="tooltip" place="top" type="dark" effect="solid"/>
                </div>
            );
        }
        return (
            <div style={{backgroundColor: !this.state.theme ? "#2a2a2a" : null}} className={this.state.theme}>
                <div id="content-wrapper">
                    {content}
                    <NotificationSystem ref="notificationSystem" allowHTML={true}/>
                    <TransactionConfirm/>
                    <WalletUnlockModal/>
                    <BrowserSupportModal ref="browser_modal"/>
                </div>
            </div>
        );

    }
}

@connectToStores
class RootIntl extends React.Component {
    static getStores() {
        return [IntlStore]
    };

    static getPropsFromStores() {
        return {
            locale: IntlStore.getState().currentLocale
        }
    };

    componentDidMount() {
        IntlActions.switchLocale(this.props.locale);
    }

    render() {

        return (
            <IntlProvider
                locale={this.props.locale.replace(/cn/, "zh")}
                formats={intlData.formats}
                initialNow={Date.now()}
            >
                <App {...this.props}/>
            </IntlProvider>
        );
    }
}

class Auth extends React.Component {
    render() {return null; }
}

let willTransitionTo = (nextState, replaceState, callback) => {
    if (nextState.location.pathname === "/init-error") {
        var db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise
        db.then(() => {
            Apis.instance().init_promise.then(() => callback()).catch(() => callback());
        });
        return;
    }
    Apis.instance().init_promise.then(() => {
        var db = iDB.init_instance(window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB).init_promise
        return Promise.all([db]).then(() => {
            console.log("db init done");
            return Promise.all([
                PrivateKeyActions.loadDbData().then(()=>AccountRefsStore.loadDbData()),
                WalletDb.loadDbData().then(() => {
                    if (!WalletDb.getWallet() && nextState.location.pathname !== "/create-account") {
                        replaceState(null, "/create-account");
                    }
                    if (nextState.location.pathname.indexOf("/auth/") === 0) {
                        replaceState(null, "/dashboard");
                    }
                }).catch((error) => {
                    console.error("----- WalletDb.willTransitionTo error ----->", error);
                }),
                WalletManagerStore.init()
            ]).then(()=> {
                callback();
            })
        });
    }).catch( error => {
        console.error("----- App.willTransitionTo error ----->", error, (new Error).stack);
        if(error.name === "InvalidStateError") {
            alert("Can't access local storage.\nPlease make sure your browser is not in private/incognito mode.");
        } else {
            replaceState(null, "/init-error");
            callback();
        }
    })
};

let routes = (
    <Route path="/" component={RootIntl} onEnter={willTransitionTo}>
        <IndexRoute component={DashboardContainer}/>
        <Route name="auth" path="/auth/:data" component={Auth}/>
        <Route name="dashboard" path="/dashboard" component={DashboardContainer}/>
        <Route name="explorer" path="explorer" component={Explorer}/>
        <Route name="fees" path="/explorer/fees" component={FeesContainer}/>
        <Route name="blocks" path="/explorer/blocks" component={Blocks}/>
        <Route name="assets" path="/explorer/assets" component={Assets}/>
        <Route name="accounts" path="/explorer/accounts" component={AccountsContainer}/>
        <Route name="witnesses" path="/explorer/witnesses" component={Witnesses}>
            <IndexRoute component={Witnesses}/>
        </Route>
        <Route name="committee-members" path="/explorer/committee-members" component={CommitteeMembers}>
            <IndexRoute component={CommitteeMembers}/>
        </Route>
        <Route name="wallet" path="wallet" component={WalletManager}>
            {/* wallet management console */}
            <IndexRoute component={WalletOptions}/>
            <Route name="wmc-change-wallet" path="change" component={ChangeActiveWallet}/>
            <Route name="wmc-change-password" path="change-password" component={WalletChangePassword}/>
            <Route name="wmc-import-keys" path="import-keys" component={ImportKeys}/>
            <Route name="wmc-brainkey" path="brainkey" component={Brainkey}/>
            <Route name="wmc-wallet-create" path="create" component={WalletCreate}/>
            <Route name="wmc-wallet-delete" path="delete" component={WalletDelete}/>
            <Route name="wmc-backup-verify-restore" path="backup/restore" component={BackupRestore}/>
            <Route name="wmc-backup-create" path="backup/create" component={BackupCreate}/>
            <Route name="wmc-backup-brainkey" path="backup/brainkey" component={BackupBrainkey}/>
            <Route name="wmc-balance-claims" path="balance-claims" component={BalanceClaimActive}/>
        </Route>
        <Route name="create-wallet" path="create-wallet" component={WalletCreate}/>
        <Route name="console" path="console" component={Console}/>
        <Route name="transfer" path="transfer" component={Transfer}/>
        <Route name="invoice" path="invoice/:data" component={Invoice}/>
        <Route name="connect" path="connect/:data" component={ConnectWallet}/>
        <Route name="markets" path="explorer/markets" component={Markets}/>
        <Route name="exchange" path="market/:marketID" component={Exchange}/>
        <Route name="settings" path="settings" component={Settings}/>
        <Route name="block" path="block/:height" component={BlockContainer}/>
        <Route name="asset" path="asset/:symbol" component={AssetContainer}/>
        <Route name="tx" path="tx" component={Transaction}/>
        <Route name="create-account" path="create-account" component={CreateAccount}/>
        <Route name="existing-account" path="existing-account" component={ExistingAccount}>
            <IndexRoute component={ExistingAccountOptions}/>
            <Route name="welcome-import-backup" path="import-backup" component={BackupRestore}/>
            <Route name="welcome-import-keys" path="import-keys" component={ImportKeys}/>
            <Route name="welcome-brainkey" path="brainkey" component={Brainkey}/>
            <Route name="welcome-balance-claim" path="balance-claim" component={BalanceClaimActive}/>
        </Route>
        <Route name="account" path="/account/:account_name" component={AccountPage}>
            <IndexRoute component={AccountOverview}/>
            <Route name="account-overview" path="overview" component={AccountOverview}/>
            <Route name="account-assets" path="assets" component={AccountAssets}/>
            <Route name="account-create-asset" path="create-asset" component={AccountAssetCreate}/>
            <Route name="account-update-asset" path="update-asset/:asset" component={AccountAssetUpdate}/>
            <Route name="account-member-stats" path="member-stats" component={AccountMembership}/>
            <Route path="vesting" component={AccountVesting}/>
            <Route name="account-permissions" path="permissions" component={AccountPermissions}/>
            <Route name="account-voting" path="voting" component={AccountVoting}/>
            <Route name="account-deposit-withdraw" path="deposit-withdraw" component={AccountDepositWithdraw}/>
            <Route name="account-orders" path="orders" component={AccountOrders}/>
            <Route path="whitelist" component={AccountWhitelist}/>
        </Route>
        <Route name="init-error" path="/init-error" component={InitError}/>
        <Route name="help" path="/help" component={Help}>
            <Route name="path1" path=":path1" component={Help}>
                <Route name="path2" path=":path2" component={Help}>
                    <Route name="path3" path=":path3" component={Help}/>
                </Route>
            </Route>
        </Route>
    </Route>
);


ReactDOM.render(<Router history={history} routes={routes}/>, document.getElementById("content"));

