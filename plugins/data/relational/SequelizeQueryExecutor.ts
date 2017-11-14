import {IRelationalDatabase, IRetrievalPlan, IDataSet} from "./IRelationalDatabase"
import {AbstractRelationalDatabase} from "./AbstractRelationalDatabase"
import {Steroid} from "../../../Steroids"
import {ValueRetriever} from "../../../helpers/ValueRetriever";

declare function require (module:string):any;
declare function setTimeOut(func:any, timeout:number):any;

class Authenticator {
    sequelize;

    constructor (sequelize){
        this.sequelize = sequelize;
    }
    
    authenticate(): Promise<any>{
        let sequelize = this.sequelize;
        let isBusy = true;
        return new Promise<any>((resolve,reject)=>{
            
            setTimeout(()=>{
                if (isBusy)
                    reject();
            },2000);

            sequelize.authenticate()
            .then(()=>{
                isBusy= false;
                resolve();
            })
            .catch(()=>{
                isBusy= false;
                reject();
            });
        });
    }
}

export class SequelizeQueryExecutor extends AbstractRelationalDatabase {
    
    private _connection;

    private convertToCamelCase(results:any[]){
        for (let i=0;i<results.length;i++){
            let obj = results[i];
            for (let objKey in obj){
                let firstLetter = objKey[0].toLowerCase();
                if (objKey[0] != firstLetter){
                    let newKey = firstLetter + objKey.substring(1);
                    obj[newKey] = obj[objKey];
                    delete obj[objKey];
                }
            }
        }
    }

    executeQuery<T>(type: {new(): T;}, query: string): Promise<T[]> {       
        return new Promise<T[]>((resolve,reject)=>{
            this.getConnection().then((sequelize)=>{
                sequelize.query(query)
                .then(results=>{
                    let val;
                    if (results.length > 0)
                        val = results[0];
                    
                    this.convertToCamelCase(val);

                    resolve(val);
                })
                .catch ((error)=>{
                    reject(error);
                });
            }).catch((err)=>{
                reject(err);
            });

            /*
            .spread((results, metadata) => {
                resolve(results);
            })
            */
        });       
    }

    private establishConnection(resolve,reject){
        let Sequelize = require("sequelize");
        let {driver, database, host, username, password, pool, dialectOptions} = this._config;
        this._connection = new Sequelize(database, username, password, {
            host: host,
            dialect: driver,
            pool: pool,
            dialectOptions: dialectOptions
        });
        resolve(this._connection);
    }

    protected getConnection(): Promise<any>{
        var self = this;
        return new Promise<any>((resolve,reject)=>{
            if (self._connection){
                let authenticator = new Authenticator(self._connection);
                authenticator.authenticate().then(()=>{
                    resolve(self._connection);
                }).catch((err)=>{
                    self.establishConnection(resolve,reject);
                });
            }
            else 
                self.establishConnection(resolve,reject);
        });
    }

}