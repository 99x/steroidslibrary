export interface IRelationalDatabase {
    executeQuery<T>(type: {new(): T;},query:string):Promise<T[]>;
}