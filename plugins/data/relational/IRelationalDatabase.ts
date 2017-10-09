export interface IRelationalDatabase {
    executeQuery<T>(type: {new(): T;},query:string):Promise<T[]>;
    getDataSet(retrievalPlan:IRetrievalPlan[]):Promise<any>;
    getMultipleResultSets(query:string, ...dataSetNames:IDataSet[]):Promise<any>;
}

export interface IVariables {
    name:string,
    value?: any,
    values?: any
}

export interface IDataSet {
    id: string,
    name: string
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