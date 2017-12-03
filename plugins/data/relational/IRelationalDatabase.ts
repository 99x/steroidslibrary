export interface IRelationalDatabase {
    executeQuery<T>(type: { new(): T; }, query: any): Promise<T[]>;
    getDataSet(retrievalPlan: IRetrievalPlan[], inputSet?: Object): Promise<any>;
    getMultipleResultSets(query: string, ...dataSetNames: IDataSet[]): Promise<any>;
}

export interface IVariables {
    name: string,
    value?: any,
    values?: any
}

export interface IDataSet {
    id: string,
    name: string
}

export enum DataType {
    // http://tediousjs.github.io/tedious/api-datatypes.html
    Bit = "Bit",
    TinyInt = "TinyInt",
    SmallInt = "SmallInt",
    Int = "Int",
    BigInt = "BigInt",
    Numeric = "Numeric",
    Decimal = "Decimal",
    SmallMoney = "SmallMoney",
    Money = "Money",
    Float = "Float",
    Real = "Real",
    SmallDateTime = "SmallDateTime",
    DateTime = "DateTime",
    DateTime2 = "DateTime2",
    DateTimeOffset = "DateTimeOffset",
    Time = "Time",
    Date = "Date",
    Char = "Char",
    VarChar = "VarChar",
    Text = "Text",
    NChar = "NChar",
    NVarChar = "NVarChar",
    NText = "NText",
    Binary = "Binary",
    VarBinary = "VarBinary",
    Image = "Image",
    Null = "Null",
    TVP = "TVP",
    UDT = "UDT",
    UniqueIdentifier = "UniqueIdentifier",
    Variant = "Variant",
    xml = "xml"
}

export interface IParameter {
    name: string,
    type: DataType,
    value: any
}

export interface IQuery {
    query: string,
    parameters: IParameter[],
    callProcedure: boolean
}

export interface IRetrievalPlan {
    dataSetName: string,
    query: any,
    cancelIfEmpty?: string[],
    variables?: IVariables[],
    subDataSets?: IRetrievalPlan[]
}

let x: IRetrievalPlan = {
    dataSetName: "mainSet",
    query: "",
    subDataSets: [{
        query: "",
        dataSetName: "subset",
        variables: [{
            name: "s",
            values: () => { }
        }]
    }]
}