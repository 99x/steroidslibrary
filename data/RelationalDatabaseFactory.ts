import {IRelationalDatabase} from "./IRelationalDatabase";
import {OnsiteQueryExecutor} from "./OnsiteQueryExecutor";
import {Steroid} from "../Steroids";

export class RelationalDatabaseFactory {
    public static create(steroid:Steroid) : IRelationalDatabase {
        let outObject = Steroid.getMockObject("database.relational");
        if (outObject === undefined)
            outObject = new OnsiteQueryExecutor(steroid);
        return outObject;
    }
}