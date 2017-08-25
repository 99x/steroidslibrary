import {Steroid} from "../Steroids"
import {RestRequestor} from "../helpers/RestRequestor"
import {IFileStorage,IFileData} from "./IFileStorage"

interface QueryRequest{
    Id:string,
    Authentication:string
}

interface QueryResponse{
    isSuccess:boolean,
    result:any[],
    Exception: any
}

export class QueryExecutorFileStorage implements IFileStorage{

    private _steroid:Steroid;
    private _config:any;

    constructor(steroid: Steroid){
        this._steroid = steroid;
        this._config = steroid.config;
    }

    getById(id: string): Promise<IFileData> {
        return new Promise<any>((resolve,reject)=>{
            let requestor = new RestRequestor(this._steroid);
            var headers = {
                "Authorization" : this._config.database.settings.authToken
            }

            requestor.getFull<any>(this._config.storage.settings.url +"/" + id ,headers)
            .then(function(result){
                let response = {
                    name:"",
                    size:result.bytes,
                    data: result.body,
                    type:result.headers["content-type"]
                }
                resolve(response);
            })
            .catch(function(result){
                reject(result);
            });
        });

    }
}