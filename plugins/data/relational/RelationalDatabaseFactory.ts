import {IRelationalDatabase} from "./IRelationalDatabase";
import {OnsiteQueryExecutor} from "./OnsiteQueryExecutor";
import {SequelizeQueryExecutor} from "./SequelizeQueryExecutor";
import {Steroid} from "../../../Steroids";
import {ValueRetriever} from "../../../helpers/ValueRetriever"

import {PluginManager} from "../../../plugins/PluginManager"
import {PluginType} from "../../../plugins/PluginType"

declare let console:any;

export class RelationalDatabaseFactory {
    public static create(steroid:Steroid, datastore?:string) : IRelationalDatabase {
        let outObject = Steroid.getMockObject("database.relational");
        if (outObject === undefined){
            let config = steroid.config;
            let dbName = null;
            
            if (datastore)
                dbName = ValueRetriever.getValue(config,`datastores.${datastore}.type`);
            else
                dbName = ValueRetriever.getValue(config,"database.type");

            switch (dbName){
                case "queryExecutor":
                    outObject = new OnsiteQueryExecutor(steroid);
                    break;
                case "orm":
                    outObject = new SequelizeQueryExecutor(steroid);
                    break;
                default:
                    if (datastore)
                        outObject = PluginManager.getInstance(steroid, PluginType.Database, dbName, datastore);
                    else
                        outObject = PluginManager.getInstance(steroid, PluginType.Database, dbName);
                    break;
            }
        }

        return outObject;
    }
}