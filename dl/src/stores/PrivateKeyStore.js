import Immutable from "immutable";
import alt from "../alt-instance";
import BaseStore from "./BaseStore";
import iDB from "../idb-instance";
import idb_helper from "../idb-helper";

import {PrivateKeyTcomb} from "./tcomb_structs";

import hash from "../common/hash"

class PrivateKeyStore extends BaseStore {
    
    constructor() {
        super();
        this.keys = Immutable.Map();
        /*this.bindListeners({
            onAddKey: PrivateKeyActions.addKey
        });*/
        this._export("loadDbData","onAddKey","onAddKey");
    }

    loadDbData() {
        var map = this.keys.asMutable()
        idb_helper.cursor("private_keys", cursor => {
            if( ! cursor) {
                this.keys = map.asImmutable()
                return
            }
            var private_key = PrivateKeyTcomb(cursor.value)
            map.set(private_key.id, private_key)
            cursor.continue()
        });
    }
    
    /** @return resolve 0 for duplicate or 1 if inserted */ 
    onAddKey(private_key_object, transaction) {
        return new Promise((resolve, reject) => {
            var _private_key_object = private_key_object
            PrivateKeyTcomb(_private_key_object)
            var duplicate = false
            var p = idb_helper.add(
                transaction.objectStore("private_keys"),
                _private_key_object
            ).catch( event => {
                // ignore_duplicates
                var error = event.target.error
                if( error.name != 'ConstraintError' ||
                    error.message.indexOf('by_pubkey') == -1
                ) { throw event  }
                duplicate = true
                event.preventDefault()
            }).then( ()=> {
                //DEBUG console.log('... idb_helper.add duplicate',duplicate)
                if(duplicate)
                    return "duplicate"
                
                idb_helper.on_transaction_end(transaction).then(
                    () => {
                        //DEBUG console.log('... this.keys.set',_private_key_object.id)
                        this.keys = this.keys.set(
                            _private_key_object.id,
                            PrivateKeyTcomb(_private_key_object)
                        )
                    }
                )
                return "added"
            })
            resolve(p)
        })
    }
    
    //onDeleteByWalletId(wallet_id, transaction, cascade = true) {
    //    var store = transaction.objectStore("private_keys")
    //    var delete_ids = [], promises = []
    //    for(let key of this.keys) {
    //        var private_key = key[1]
    //        if(private_key.wallet_id === wallet_id) {
    //            promises.push(
    //                new Promise((resolve, reject)=>{
    //                    let request = store.delete(private_key.id)
    //                    ((private_id, resolve)=>{
    //                        request.onsuccess = () => {
    //                            this.keys = this.keys.delete(private_id)
    //                            resolve()
    //                        }
    //                    })(private_key.id, resolve)
    //                    request.onerror = (e) => {
    //                        console.log("ERROR!!! onDeleteByWalletId - ", e.target.error.message, value);
    //                        reject(e.target.error.message)
    //                    }
    //                })
    //            )
    //        }
    //    }
    //    return Promise.all(promises)
    //}



}

module.exports = alt.createStore(PrivateKeyStore, "PrivateKeyStore");