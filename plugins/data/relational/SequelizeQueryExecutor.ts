import {IRelationalDatabase, IRetrievalPlan, IDataSet} from "./IRelationalDatabase"
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

    private getConnection(): Promise<any>{
        var self = this;
        return new Promise<any>((resolve,reject)=>{

            let connectionPerRequest = this._config.connectionPerRequest ? this._config.connectionPerRequest : true;

            if (connectionPerRequest){
                this.establishConnection(resolve,reject);
            }else {
                if (self._connection){
                    self._connection.authenticate().then(()=>{
                        resolve(self._connection);
                    }).catch((err)=>{
                        this.establishConnection(resolve,reject);
                    });
                }
                else 
                    this.establishConnection(resolve,reject);
            }

        });
    }

    getDataSet(retrievalPlan:IRetrievalPlan[], inputSet?: Object):Promise<any> {
        let responseDataSet = {};
        return new Promise<any>((resolve,reject)=>{
            this.getConnection().then((sequelize)=>{
                this.executeRetrievalUnit(retrievalPlan,responseDataSet, inputSet ? inputSet : {},sequelize)
                .then((result)=>{
                    resolve(responseDataSet);
                })
                .catch((err)=>{
                    reject(err);
                });
            }).catch((err)=>{
                reject(err);
            });
        })
        
    }

    private executeRetrievalUnit(retrievalPlans: IRetrievalPlan[], responseDataSet, inputSet, sequelize):Promise<any>{        
        let promiseArray = [];

        for (let i=0;i<retrievalPlans.length;i++){
            let plan:IRetrievalPlan = retrievalPlans[i];
            let promiseObj;

            if (inputSet){
                let query = plan.query;
                for(let key in inputSet){
                    let val = inputSet[key];
                    query = query.replace("{{" + key + "}}", val);
                }
                plan.query = query;
            }

            if (plan.subDataSets)
                promiseObj = this.executeWithSubDataSets(plan, sequelize, responseDataSet, inputSet);
            else
                promiseObj = this.executeSingleUnit(plan, sequelize, responseDataSet, inputSet);
            
            promiseArray.push(promiseObj);
        }

        return Promise.all(promiseArray);
    }

    private async executeSingleUnit(plan:IRetrievalPlan,sequelize,responseDataSet, inputSet): Promise<any>{
        return new Promise<any>((resolve,reject)=>{

            if (plan.cancelIfEmpty){
                for (let i=0;i<plan.cancelIfEmpty.length;i++)
                if (!inputSet[plan.cancelIfEmpty[i]]){
                    let result = [];
                    responseDataSet[plan.dataSetName] = result;
                    resolve(result);
                }
            }

            this.executeQuery(Object,plan.query)
            .then((queryResult)=>{
                responseDataSet[plan.dataSetName] = queryResult;
                resolve(queryResult);
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }

    private async executeWithSubDataSets(plan:IRetrievalPlan,sequelize,responseDataSet, inputSet): Promise<any>{
        return new Promise<any>((resolve,reject)=>{
            this.executeSingleUnit(plan, sequelize,responseDataSet, inputSet)
            .then((result)=>{
                let newInputSet = {};

                for (let i=0;i<plan.variables.length;i++){
                    let processor = plan.variables[i];
                    let finalValue;
                    if (processor.value){
                        if (typeof processor.value == "function"){
                            if (result.length > 0){
                                finalValue = [result[0]].map(processor.value)[0];
                            }
                            
                        }else 
                            finalValue = processor.value;
                    }else if (processor.values){
                        let inVals = result.map(processor.values).filter(x => x);
                        finalValue = inVals.join(",");
                    }

                    newInputSet[processor.name] = finalValue;
                }

                this.executeRetrievalUnit(plan.subDataSets, responseDataSet,newInputSet, sequelize)
                .then((result)=>{
                    resolve(result);
                })
                .catch((result)=>{
                    reject(result);
                });
            })
            .catch((err)=>{
                reject(err);
            });
        });
    }


    private normalizeDatasetValues(result, datasetNames) {
        let currentIndex = 0;
        let dataset = {};
         for(let i=0 ; i<result.length ; i++) {
             let obj = result[i];
             let currentColumns = Object.keys(obj);
             let uniqId;
 
             for(let i=0; i<currentColumns.length; i++) {
                 let val = currentColumns[i];
                 currentColumns[i] = val.toLowerCase();
             } 
             let datasetName;
             for(let i=0; i<datasetNames.length; i++) {
                 uniqId = datasetNames[i]["id"];
                 if(uniqId) 
                     uniqId = uniqId.toLowerCase();
                 if(currentColumns.indexOf(uniqId) > -1) {
                     datasetName = dataset[datasetNames[i]["name"]];
                     if(datasetName) {
                         dataset[datasetNames[i]["name"]].push(obj);
                     } else {
                         dataset[datasetNames[i]["name"]] = [];
                         dataset[datasetNames[i]["name"]].push(obj);
                     }
                     break;
                 }
             }
 
        }
        return dataset;
     }

    getMultipleResultSets(query:string, ...dataSetNames:IDataSet[]):Promise<any>{
        return new Promise<any>((resolve,reject)=>{
            this.executeQuery(Object,query)
            .then((res)=>{
                try{
                    resolve(this.normalizeDatasetValues(res,dataSetNames));
                }catch (e){
                    reject(e);
                }
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    constructor(steroid: Steroid){
        this._steroid = steroid;
        this._config = ValueRetriever.getValue(steroid.config,"database.settings");
    }

}