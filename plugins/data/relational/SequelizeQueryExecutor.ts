import {IRelationalDatabase} from "./IRelationalDatabase"
import {Steroid} from "../../../Steroids"
import {ValueRetriever} from "../../../helpers/ValueRetriever";

declare function require (module:string):any;

export class SequelizeQueryExecutor implements IRelationalDatabase {
    
    private _steroid:Steroid;
    private _config:any;
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
            let sequelize = this.getConnection();
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
            /*
            .spread((results, metadata) => {
                resolve(results);
            })
            */
        });       
    }

    private getConnection(){
        if (this._connection)
            return this._connection;            
        else {
            let Sequelize = require("sequelize");
            let {driver, database, host, username, password, pool} = this._config;
            this._connection = new Sequelize(database, username, password, {
                host: host,
                dialect: driver,
                pool: pool
            });
            return this._connection;
        }
    }

    constructor(steroid: Steroid){
        this._steroid = steroid;
        this._config = ValueRetriever.getValue(steroid.config,"database.settings");
    }

}