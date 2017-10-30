import {IEvent, ICallback, Composer} from "./Messages"
import {Steroid} from "./Steroids"
import {updateConfig, Config} from "./Config"
import {Flask} from "./Flask"

declare function require(module:string):any;

export abstract class AbstractService extends Flask {
    
    private _steroid:Steroid;
    private _event;
    private _callback;
    private _lambdaContext;

    constructor(event: IEvent, context:any, callback: ICallback){
        super();
        this._lambdaContext = context;
        this._callback = callback;
        this._event = event;
        this._steroid = new Steroid(event,context,callback);
    }

    private loadConfig (callback){
        let fs = require("fs");

        let configFileName = Steroid.globalConfig.configFileName;
        let steroidsConfig = Config;

        if (configFileName){
            fs.readFile(configFileName, function (err, data) {
                let configJson;
                if (!err){
                    try{
                        configJson = JSON.parse(data);
                        updateConfig(configJson);
                        delete Steroid.globalConfig.configFileName;
                        callback(undefined,configJson);
                    } catch (err){
                        callback (err);
                    }
                } else 
                    callback (err);
            });     
        }else {
           callback(undefined, steroidsConfig);
        }
    }

    public handle (){
        let self = this;
        let fs = require("fs");

        this.loadConfig(function (err, configObj) {
            if (err){
                let errorMessage:any = {exception:err}
                self._steroid.response().setParams(false,5003);
                let response = Composer.composeError(self._steroid, errorMessage);

                self._callback(response,undefined);
            }
            else{
                try{
                    self.onHandle(self._steroid)
                    .then((result)=>{
                        let response; 
                        let extraSettings = self._steroid.internals().getExtraSettings();

                        if (extraSettings.isFormattingPrevented === undefined)
                            response = Composer.compose(self._steroid,result);
                        else
                            response = Composer.convertToLambdaProxyIntegration(self._steroid, result);
                        
                        let contextObj = self._steroid.internals().getGeneratedContext();
                        self._lambdaContext.succeed(contextObj);
           
                    })
                    .catch((e)=>{
                        let errorMessage:any = {exception:e}
                        self._steroid.response().setHttpCode("501");
                        self._steroid.response().setParams(false,5001);
                        
                        let logs:any[] = self._steroid.internals().getResource("logger").getLogs();
                        errorMessage.requestTrace = logs.map(item=> {
                            let time;
                            try{
                                let myDate = item.time;
                                time = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + "." + myDate.getMilliseconds();
                            }catch (e){
                                time = "0000/00/00 00:00:00.00"
                            }
                            
                            let type = (item.type ==1) ? "Logic" : ((item.type==0) ? "System" : "Error");

                            return "[" + time + "] [" + type  + "] - " + item.message;
                        });
                        let response:any = Composer.composeError(self._steroid,errorMessage);
                        self._callback(undefined,response);
                    });
                }
                catch (e){
                    let errorMessage:any = {exception:e}
                    self._steroid.response().setHttpCode("501");
                    self._steroid.response().setParams(false,5002);
                    let response = Composer.composeError(self._steroid,errorMessage);
                    self._callback(undefined,response);
                }
            }

        });

    }

    protected abstract async onHandle(steroid: Steroid);
}