import {IRelationalDatabase, IRetrievalPlan} from "./IRelationalDatabase"
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
            let {driver, database, host, username, password, pool, dialectOptions} = this._config;
            this._connection = new Sequelize(database, username, password, {
                host: host,
                dialect: driver,
                pool: pool,
                dialectOptions: dialectOptions
            });
            return this._connection;
        }
    }

    getDataSet(retrievalPlan:IRetrievalPlan[]):Promise<any> {
        let responseDataSet = {};
        let sequelize = this.getConnection();
        return new Promise<any>((resolve,reject)=>{
            this.executeRetrievalUnit(retrievalPlan,responseDataSet,{},sequelize)
            .then((result)=>{
                resolve(responseDataSet);
            })
            .catch((err)=>{
                reject(err);
            })
        })
        
    }

    private executeRetrievalUnit(retrievalPlans: IRetrievalPlan[], responseDataSet, inputSet, sequelize):Promise<any>{        
        let promiseArray = [];

        for (let i=0;i<retrievalPlans.length;i++){
            let plan:IRetrievalPlan = retrievalPlans[i];
            let promiseObj;
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

            let query = plan.query;
            for(let key in inputSet){
                let val = inputSet[key];
                query = query.replace("{{" + key + "}}", val);
            }

            if (plan.cancelIfEmpty){
                for (let i=0;i<plan.cancelIfEmpty.length;i++)
                if (!inputSet[plan.cancelIfEmpty[i]]){
                    let result = [];
                    responseDataSet[plan.dataSetName] = result;
                    resolve(result);
                }
            }

            this.executeQuery(Object,query)
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


    private divideDataSets(result,dataSetNames){
        let currentDataSet = undefined;
        let currentIndex = -1;
        let generatedIndex = -1;
        let dataSets = {};
        let prevColumns = undefined;
        
        for (let i=0;i<result.length;i++){
            let obj = result[i];
            let currentColumns = [];
            
            for (let pKey in obj)
                currentColumns.push(pKey);
            
            currentColumns = currentColumns.sort();

            let isEqual = false;

            if (prevColumns){
                if (prevColumns.length == currentColumns.length){
                    let isOk = true;
                    for (let i=0;i<prevColumns.length;i++)
                    if (prevColumns[i] != currentColumns[i]){
                        isOk = false;
                        break;
                    }
                    isEqual = isOk;
                }  
            }

            prevColumns = currentColumns;

            if (!isEqual){
                currentIndex++;
                currentDataSet = undefined;
                if (dataSetNames)
                if (dataSetNames[currentIndex])
                    currentDataSet = dataSetNames[currentIndex];

                if (!currentDataSet){
                    generatedIndex++;
                    currentDataSet = "untitled"  + generatedIndex;
                }

                dataSets[currentDataSet] = [];
            }

            dataSets[currentDataSet].push(obj);
            
        }

        return dataSets;
    }

    getMultipleResultSets(query:string, ...dataSetNames:string[]):Promise<any>{
        return new Promise<any>((resolve,reject)=>{
            this.executeQuery(Object,query)
            .then((res)=>{
                try{
                    resolve(this.divideDataSets(res,dataSetNames));
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