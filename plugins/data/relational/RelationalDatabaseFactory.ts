import {IRelationalDatabase} from "./IRelationalDatabase";
import {OnsiteQueryExecutor} from "./OnsiteQueryExecutor";
import {SequelizeQueryExecutor} from "./SequelizeQueryExecutor";
import {Steroid} from "../../../Steroids";
import {ValueRetriever} from "../../../helpers/ValueRetriever"

declare let console:any;

export class RelationalDatabaseFactory {
    public static create(steroid:Steroid) : IRelationalDatabase {
        let outObject = Steroid.getMockObject("database.relational");
        if (outObject === undefined){
            let config = steroid.config;
            let dbName = ValueRetriever.getValue(config,"database.type");
            switch (dbName){
                case "queryExecutor":
                    outObject = new OnsiteQueryExecutor(steroid);
                    break;
                default:
                    outObject = new SequelizeQueryExecutor(steroid);
                    break;
            }
        }

        return outObject;
    }
}