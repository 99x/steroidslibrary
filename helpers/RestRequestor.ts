declare function require(module:string):any;

import {Steroid} from "../Steroids"

export class RestRequestor <T>
{

    private _needle;
    private _steroid:Steroid;

    constructor(steroid:Steroid){
        this._steroid = steroid;
        this._needle = require("needle");
    }

    public post<T>(url, postBody, headers) : Promise<T> {
        let self = this;

        return new Promise<T>((resolve,reject)=>{
            
            let options:any = {};

            if (headers)
                options.headers = headers;
            else
                options.headers = {};

            let steroid = this._steroid;
            let config = steroid.config;
            this._needle.post(url, postBody, options, function(err:any, resp:any) {
                if (err)
                    reject(err);
                else
                    resolve(<T>resp.body);
            });

            
        });
    }

    public get <T>(url, headers) : Promise<T>{
        return this._get(url,headers, function(err:any, resp:any, resolve,reject) {
                if (err)
                    reject(err);
                else
                    resolve(<T>resp.body);
            });
    }

    public getFull <T>(url, headers) : Promise<T>{
        return this._get(url, headers, function(err:any, resp:any, resolve,reject) {
                if (err)
                    reject(err);
                else
                    resolve(<T>resp);
            });
    }
    private _get<T>(url, headers, needleFunc) : Promise<T> {
        let self = this;

        return new Promise<T>((resolve,reject)=>{
            
            let options:any = {};

            if (headers)
                options.headers = headers;
            else
                options.headers = {};

            let steroid = this._steroid;
            let config = steroid.config;
            this._needle.get(url, options, function(err:any, resp:any){
                needleFunc(err,resp,resolve,reject);
            });

            
        });
    }

}