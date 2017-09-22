export interface IRelationalDatabase {
    executeQuery<T>(type: {new(): T;},query:string):Promise<T[]>;
    getDataSet(retrievalPlan:IRetrievalPlan[]):Promise<any>;
}

export interface IRetrievalParameter {
    name:string,
    func: Function
}

export interface IRetrievalPlan {
    dataSetName:string,
    query:string,
    postProcessors?:IRetrievalParameter[],
    subDataSets?: IRetrievalPlan[]
}

let x:IRetrievalPlan = {
    dataSetName:"mainSet",
    query:"",
    subDataSets:[{
        query:"",
        dataSetName:"subset",
        postProcessors:[{
            name:"s",
            func: ()=>{}
        }]
    }]
}