import {IEvent, ICallback, Composer} from "./Messages"
import {Config} from "./Config"
import {ActivityLogger,LogType} from "./ActivityLogger"
import {SteroidsMapper} from "./plugins/mapper/SteroidsMapper"
import {ArrayHelpers} from "./helpers/ArrayHelpers"
import {AsyncIterator} from "./helpers/AsyncIterator"
import {Validator} from "./helpers/Validator"
import {ServiceInvoker} from "./ServiceInvoker"

import {IFileStorage} from "./plugins/storage/IFileStorage"
import {FileStorageFactory} from "./plugins/storage/FileStorageFactory"

import {IRelationalDatabase} from "./plugins/data/relational/IRelationalDatabase"
import {RelationalDatabaseFactory} from "./plugins/data/relational/RelationalDatabaseFactory"

import {ICacheDatabase} from "./plugins/data/cache/ICacheDatabase"

export interface IDatabaseProvider
{
    relational(): IRelationalDatabase;
    cache(): ICacheDatabase;
}

export interface IStorageProvider {
    file():IFileStorage
}

export interface ISteroidResponse {
    httpCode?: string,
    httpHeaders?:any,
    message?:string,
    success:boolean,
    code:number,
    response: any
}

declare let console:any;
declare function require(moduleName:string):any;

export class SteroidUtils 
{
    async forEach<T>(arr:any[], inObject:any, logicFunc: Function): Promise<T> {
        let promiseObj = new Promise<T>((resolve,reject)=>{
            let iterator = new AsyncIterator(arr, inObject);
            iterator.logic(logicFunc);
            iterator.onComplete(f=>resolve(inObject));
            iterator.start();
        });
        return promiseObj;
    }
}

export class Steroid {
    
    public config;
    public static globalConfig = {configFileName:"steroids.json"};

    private _event: IEvent;
    private _callback: ICallback;
    private _lambdaContext:any;
    private _contextObj:any;
    private _extraSettings:any;
    private _logger: ActivityLogger;
    
    private _heap: any;
    private static _staticHeap:any = {};
    private responseParams:any = {};

    private static mockObjects = {};

    public static newTestSteroid(){
        let event:IEvent = {
            headers : {},
            httpMethod: "GET",
            pathParameters:{},
            body:{},
            queryStringParameters:{}
        };
        let steroid = new Steroid(event,{},()=>{});
        return steroid;
    }


    public static initialize(currentFolder: string,  dependencyFunction: ()=>any){
        var p = new Proxy({}, {
            get: function(target, property:string, receiver) {
                return function(event,context,callback){

                let moduleFileName;
                let moduleName;
                let path = require("path");
                let fs = require("fs");
                if (property.includes("_")){
                    let splitData = property.split("_");
                    moduleName = splitData[splitData.length-1];
                    splitData[splitData.length-1] = moduleName + ".js"
                    moduleFileName = path.join(currentFolder,...splitData);
                    
                } else {
                    moduleFileName = path.join(currentFolder,property + ".js");
                    moduleName = property;
                }

                if (!fs.existsSync(moduleFileName)){
                    context.succeed({body:"{}", headers:{}, statusCode:400});
                }else{
                    if (dependencyFunction != undefined && dependencyFunction != null)
                        dependencyFunction();

                        ServiceInvoker.invokeByFilename(moduleName,moduleFileName,event,context,callback);
                    }
                }
            }
        });

        return p;
    }

    public static mock(what:string, mockObject:any){
        Steroid.mockObjects[what] = mockObject;
    }

    public static getMockObject(what:string){
        return Steroid.mockObjects[what];
    }

    public validator(obj:any){
        return new Validator(obj);
    }

    public mapper(obj:any): SteroidsMapper{
        return new SteroidsMapper(obj);
    }

    public utils(): SteroidUtils{
        return new SteroidUtils();
    }

    public request(): IEvent
    {
        try{
            if (!this._event.headers)
                this._event.headers = {};
            
            if (this._event.headers.get === undefined)
                this._event.headers.get = (key:String)=>{
                    for (let hk in this._event.headers)
                        if (hk.toLowerCase() === key.toLowerCase())
                            return this._event.headers[hk];
                };

            if (this._event.body !== undefined)
            if (typeof this._event.body !== "object")
                this._event.body = JSON.parse(this._event.body)

        }catch (e){

        }
        return this._event;
    }

    public response(){
        var self = this;

        return {
            setSuccessCode: (code:number)=>{
                self.responseParams.success = true;
                self.responseParams.code = code;
            },
            setErrorCode: (code:number)=>{
                self.responseParams.success = false;
                self.responseParams.code = code;
            },
            setParams: (success:boolean, code:number)=>{
                self.responseParams.success = success;
                self.responseParams.code = code;
            },
            setMessage: (message:string)=>{
                self.responseParams.message = message;
            },
            setCustomError:(message:string)=>{
                self.responseParams.success = false;
                self.responseParams.customError = {message:message}
            },
            getParams:()=>{
                return self.responseParams;
            },
            setHttpCode:(code:string)=>{
                self._contextObj.statusCode = code;
            },
            setHttpHeaders:(headers:any)=>{
                for (let hk in headers){
                    let headerKey;
                    for (let cHk in self._contextObj.headers)
                    if (cHk.toLowerCase().trim() === hk.toLowerCase().trim()){
                        headerKey = cHk;
                        break;
                    }

                    if (headerKey === undefined)
                        headerKey = hk;

                    self._contextObj.headers[headerKey] = headers[hk];
                }
            },
            preventJsonFormatting:()=>{
                self._extraSettings.isFormattingPrevented = true;
            },
            returnRawJson:()=>{
                self._extraSettings.canReturnWithoutStringify = true;
            },
            triggerCallback:(result:any)=>{
                let response = Composer.compose(self,result);
                self._callback(undefined,response);
            },
            setResponse:function(response:ISteroidResponse){
                self.responseParams.success = response.success;
                self.responseParams.code = response.code;
                if (response.httpCode)
                    self._contextObj.statusCode = response.httpCode;
                if (response.httpHeaders)
                    this.setHttpHeaders(response.httpHeaders);
                if (response.message)
                    this.setMessage(response.message);

                return response.response;
            }
        }
    }

    public log(message:string, logType = LogType.Logic){
        this._logger.log(message, logType);
    }



    public storage(): IStorageProvider {
        let self = this;
        return {
            file:()=>{
                return FileStorageFactory.create(self);
            }
        }
    }

    public database(): IDatabaseProvider {
        let self = this;
        let heapObj;
        let connPerRequest = this.config.database.connectionPerRequest;
        if (connPerRequest == undefined || connPerRequest == null)
            connPerRequest = true;
            
        if (connPerRequest)
            heapObj = this._heap;
        else
            heapObj = Steroid._staticHeap;

        if (!heapObj.database){
            heapObj.database = {
                relational: function(): IRelationalDatabase {
                    if (!heapObj.relational_db)
                        heapObj.relational_db = RelationalDatabaseFactory.create(self);
                    return heapObj.relational_db;
                },
                cache: function(): ICacheDatabase {
                    return undefined;
                }
            }
        }

        return heapObj.database;
    }

    constructor (event:IEvent, context:any, callback: ICallback){
        this._lambdaContext = context;
        this._contextObj = {statusCode:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers":"*","Access-Control-Allow-Methods":"*"}};
        this._extraSettings = {canReturnWithoutStringify:false};
        this._event = event;
        this._callback = callback;
        this.config = Config;
        this._logger = new ActivityLogger();
        this._heap = {};
    }

    public internals(){
        return {
            getResource : (resource:string):any=>{
                switch (resource){
                    case "logger":
                        return this._logger;
                    default:
                        return {};
                }
            },
            generateCallback: (result:any)=>{
                let response = Composer.compose(this, result);
                let cb = this._callback;
                
                this._lambdaContext.succeed(this._contextObj);
                this._callback(undefined, response);
            },
            getGeneratedContext: ()=>{
                return this._contextObj;
            },
            getExtraSettings: ()=>{
                return this._extraSettings;
            }
        }
    }

}

ArrayHelpers.initialize();