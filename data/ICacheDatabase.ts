export interface ICacheDatabase {
    get<T>(key:string):T;
    set<T>(key:string, value:string):T;
}