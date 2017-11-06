import {IFileStorage} from "./IFileStorage";
import {QueryExecutorFileStorage} from "./QueryExecutorFileStorage";
import {Steroid} from "../../Steroids";

import {ValueRetriever} from "../../helpers/ValueRetriever"
import {PluginManager} from "../../plugins/PluginManager"
import {PluginType} from "../../plugins/PluginType"

export class FileStorageFactory {
    public static create(steroid:Steroid) : IFileStorage {
        let outObject = Steroid.getMockObject("storage.file");
        
        if (outObject === undefined){
            let config = steroid.config;
            let storageName = ValueRetriever.getValue(config,"storage.type");

            switch (storageName){
                case "documentDownloader":
                    outObject = new QueryExecutorFileStorage(steroid);
                    break;
                default:
                    outObject = PluginManager.getInstance(steroid, PluginType.Storage, storageName);
                    break;
            }
            
        }
        return outObject;
    }
}