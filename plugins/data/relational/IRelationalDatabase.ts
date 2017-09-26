export interface IRelationalDatabase {
    executeQuery<T>(type: {new(): T;},query:string):Promise<T[]>;
    getDataSet(retrievalPlan:IRetrievalPlan[]):Promise<any>;
}

export interface IVariables {
    name:string,
    value?: any,
    values?: any
}

export interface IRetrievalPlan {
    dataSetName:string,
    query:string,
    cancelIfEmpty?:string[],
    variables?:IVariables[],
    subDataSets?: IRetrievalPlan[]
}

let x:IRetrievalPlan = {
    dataSetName:"mainSet",
    query:"",
    subDataSets:[{
        query:"",
        dataSetName:"subset",
        variables:[{
            name:"s",
            values: ()=>{}
        }]
    }]
}