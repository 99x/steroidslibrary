import {IFileStorage} from "./IFileStorage";
import {QueryExecutorFileStorage} from "./QueryExecutorFileStorage";
import {Steroid} from "../Steroids";

export class FileStorageFactory {
    public static create(steroid:Steroid) : IFileStorage {
        let outObject = Steroid.getMockObject("storage.file");
        if (outObject === undefined)
            outObject = new QueryExecutorFileStorage(steroid);
        return outObject;
    }
}