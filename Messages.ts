import {Steroid} from "./Steroids"

declare let console:any;

export interface IEvent
{
    pathParameters:any;
    httpMethod:string;
    headers:any;
    body:any;
    queryStringParameters:any;
}

export interface IResponse {  
  success: boolean;
  code: number;
  error: any;
  history: Array<any>;
  response: any;

}

export interface ICallback {  
  (error: any, result: IResponse): void;
}

export class Composer{
  

  private static _compose(steroid:Steroid, result, isError){
    let response = {
      success:true,
      code:undefined,
      error:undefined,
      response: undefined,
      history: undefined,
      message:undefined
    };

    let params:any = steroid.response().getParams();
    if (steroid !== undefined){
      if (params.success !== undefined)
        response.success = params.success;
      if (params.code !== undefined)
        response.code = params.code;   
      if (params.message !== undefined)    
        response.message = params.message;  
    }

    if (isError == true){
      if (result !== undefined){
        if (result.exception !== undefined){
          response.error = {
            message: result.exception.message,
            stack: result.exception.stack
          }

          if (result.requestTrace !== undefined)
            response.error.requestTrace = result.requestTrace;
        }
      }

    }else {
      if (params.customError == undefined){
        if (response.success == false){
          response.error = {message:result};
        }else
          response.response = result;
      }
      else
        response.error = params.customError;
    }

    return Composer.convertToLambdaProxyIntegration(steroid, response);
  }

  public static compose (steroid:Steroid, result){
    return Composer._compose(steroid,result,false);
  }

  public static composeError(steroid:Steroid, result){
    let composeResult = Composer._compose(steroid,result,true);
    console.log("Error occured while processing the request : ", composeResult.code, composeResult.error);
    return composeResult;
  }

  public static convertToLambdaProxyIntegration(steroid:Steroid, response:any){
    
    let contextObj = steroid.internals().getGeneratedContext();
    let extraSettings = steroid.internals().getExtraSettings();

    if (typeof response === "string")
      contextObj.body = response;
    else {
      if (extraSettings.canReturnWithoutStringify==false)
        contextObj.body = JSON.stringify(response);
      else
        contextObj.body = response;
    }

    return contextObj;
  }
}
