import { IRelationalDatabase, IRetrievalPlan, IDataSet, IQuery } from "./IRelationalDatabase"
import { Steroid } from "../../../Steroids"
import { ValueRetriever } from "../../../helpers/ValueRetriever";

declare function require(module: string): any;

export abstract class AbstractRelationalDatabase implements IRelationalDatabase {

    protected _steroid: Steroid;
    protected _config: any;

    protected abstract getConnection(): Promise<any>;
    public abstract executeQuery<T>(type: { new(): T; }, query: any): Promise<T[]>;

    getDataSet(retrievalPlan: IRetrievalPlan[], inputSet?: Object): Promise<any> {
        let responseDataSet = {};
        return new Promise<any>((resolve, reject) => {
            this.executeRetrievalUnit(retrievalPlan, responseDataSet, inputSet ? inputSet : {})
                .then((result) => {
                    resolve(responseDataSet);
                })
                .catch((err) => {
                    reject(err);
                });
        })

    }

    private executeRetrievalUnit(retrievalPlans: IRetrievalPlan[], responseDataSet, inputSet): Promise<any> {
        let promiseArray = [];

        for (let i = 0; i < retrievalPlans.length; i++) {
            let plan: IRetrievalPlan = retrievalPlans[i];
            let promiseObj;

            if (inputSet) {
                let query = typeof (plan.query) == "object" ? plan.query.query : plan.query;
                for (let key in inputSet) {
                    let val = inputSet[key];
                    query = query.replace("{{" + key + "}}", val);
                }
                let qObj = typeof (plan.query) == "object" ? plan.query : plan
                qObj.query = query;
            }

            if (plan.subDataSets)
                promiseObj = this.executeWithSubDataSets(plan, responseDataSet, inputSet);
            else
                promiseObj = this.executeSingleUnit(plan, responseDataSet, inputSet);

            promiseArray.push(promiseObj);
        }

        return Promise.all(promiseArray);
    }

    private async executeSingleUnit(plan: IRetrievalPlan, responseDataSet, inputSet): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            let canExecute = true;
            if (plan.cancelIfEmpty) {
                for (let i = 0; i < plan.cancelIfEmpty.length; i++)
                    if (!inputSet[plan.cancelIfEmpty[i]]) {
                        let result = [];
                        responseDataSet[plan.dataSetName] = result;
                        canExecute = false;
                        resolve(result);

                    }
            }
            
            if (canExecute){
                this.executeQuery(Object, plan.query)
                    .then((queryResult) => {
                        responseDataSet[plan.dataSetName] = queryResult;
                        resolve(queryResult);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    private async executeWithSubDataSets(plan: IRetrievalPlan, responseDataSet, inputSet): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.executeSingleUnit(plan, responseDataSet, inputSet)
                .then((result) => {
                    let newInputSet = {};

                    for (let i = 0; i < plan.variables.length; i++) {
                        let processor = plan.variables[i];
                        let finalValue;
                        if (processor.value) {
                            if (typeof processor.value == "function") {
                                if (result.length > 0) {
                                    finalValue = [result[0]].map(processor.value)[0];
                                }

                            } else
                                finalValue = processor.value;
                        } else if (processor.values) {
                            let inVals = result.map(processor.values).filter(x => x);
                            finalValue = inVals.join(",");
                        }

                        newInputSet[processor.name] = finalValue;
                    }

                    for (let ik in inputSet)
                        if (!newInputSet[ik])
                            newInputSet[ik] = inputSet[ik];

                    this.executeRetrievalUnit(plan.subDataSets, responseDataSet, newInputSet)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((result) => {
                            reject(result);
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    private normalizeDatasetValues(result, datasetNames) {
        let currentIndex = 0;
        let dataset = {};
        for (let i = 0; i < result.length; i++) {
            let obj = result[i];
            let currentColumns = Object.keys(obj);
            let uniqId;

            for (let i = 0; i < currentColumns.length; i++) {
                let val = currentColumns[i];
                currentColumns[i] = val.toLowerCase();
            }
            let datasetName;
            for (let i = 0; i < datasetNames.length; i++) {
                uniqId = datasetNames[i]["id"];
                if (uniqId)
                    uniqId = uniqId.toLowerCase();
                if (currentColumns.indexOf(uniqId) > -1) {
                    datasetName = dataset[datasetNames[i]["name"]];
                    if (datasetName) {
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

    getMultipleResultSets(query: string, ...dataSetNames: IDataSet[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.executeQuery(Object, query)
                .then((res) => {
                    try {
                        resolve(this.normalizeDatasetValues(res, dataSetNames));
                    } catch (e) {
                        reject(e);
                    }
                }).catch((err) => {
                    reject(err);
                });
        });
    }

    constructor(steroid: Steroid) {
        this._steroid = steroid;
        this._config = ValueRetriever.getValue(steroid.config, "database.settings");
    }

}