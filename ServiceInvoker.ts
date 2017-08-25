import {IEvent, ICallback, IResponse} from "./Messages"
import {AbstractService} from "./AbstractService"
import {Flask} from "./Flask"

declare function require(filename:string):any;

export class ServiceInvoker {
    
    public static invokeByFilename(moduleName:string, filename:string, event:IEvent, context:any, callback:ICallback){
        Flask.initialize();
        let handlerModule = require(filename);
        let handlerObject = new handlerModule[moduleName](event,context,callback);
        handlerObject.inject();
        handlerObject.handle();        
    }

    public static invoke<T extends AbstractService>(type: { new(event:IEvent, context:any, callback:ICallback): T ;}, event:IEvent, context:any, callback:ICallback){
        Flask.initialize();
        let handlerObject = new type(event,context,callback);
        handlerObject.inject();
        handlerObject.handle();
    }

    public static test <T extends AbstractService>(type: { new(event:IEvent, context:any, callback:ICallback): T ;}){
        let mockContext = {succeed:()=>{},fail:()=>{}};
        return {
            withParameters: function(event:IEvent): Promise<IResponse>{
                let promiseObj = new Promise<IResponse>(function(resolve,reject){
                    let handlerObject = new type(event,mockContext, function(error, message){
                        if (error)
                            resolve(error);
                        else
                            resolve(message);
                    });
                    handlerObject.inject();
                    handlerObject.handle();
                });

                return promiseObj;
            }
        }
    }
}