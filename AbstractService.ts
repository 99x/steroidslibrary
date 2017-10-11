import {IEvent, ICallback, Composer} from "./Messages"
import {Steroid} from "./Steroids"
import {updateConfig} from "./Config"
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

    public handle (){
        let self = this;
        let fs = require("fs");

        fs.readFile('steroids.json', function (err, data) {
            if (err){
                let errorMessage:any = {exception:err}
                self._steroid.response().setParams(false,5003);
                let response = Composer.composeError(self._steroid, errorMessage);

                self._callback(response,undefined);
            }
            else{
                try{
                    let configObj = JSON.parse(data);
                    updateConfig(configObj);
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