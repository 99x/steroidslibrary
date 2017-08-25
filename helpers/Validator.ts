declare function require(module:string):any;

export class Validator {
    
    private _mapping = [];
    private _pluginList = {};
    private _obj:any;

    constructor(obj:any){
        this._obj = obj;
    }

    public when(path:string){  
        let _currentMapping:any = {path:path,stop:false};
        this._mapping.push(_currentMapping);

        let mappingObj = {
            is:(what:string) =>{
                _currentMapping.isPositive = true;
                _currentMapping.plugin = what;
                return mappingObj;
            },
            isNot: (what)=>{
                _currentMapping.isPositive = false;
                _currentMapping.plugin = what;
                return mappingObj;
            },
            then: (message)=>{
                _currentMapping.value = message;
                return mappingObj;
            },
            stop: ()=>{
                _currentMapping.stop = true;
            }
        }

        return mappingObj;
    }

    public validate():any{
        let validationMessages = [];
        let mObj = this._mapping;

        for (let i=0;i<this._mapping.length;i++){
            let mVal = this._mapping[i];
            let mKey = mVal.path;

            let validObj;
            if (typeof mVal.plugin === "function"){
                validObj = {onValidate:mVal.plugin};
            } else {
                let plugList = this._pluginList;
                validObj = plugList[mVal.plugin];
                if (!validObj){
                    validObj = require("./validators/" + mVal.plugin + ".js");
                    plugList[mVal.plugin] = validObj;
                }
            }

            if(validObj){
                if (validObj.onValidate){
                    let value =this._obj;
                    let result = validObj.onValidate(value[mKey]);

                    if (mVal.isPositive){
                        if (result == true){
                            validationMessages.push({field:mKey, message: mVal.value});
                            if (mVal.stop == true)
                                break;
                        }
                    }else {
                        if (result == false){
                            validationMessages.push({field:mKey, message: mVal.value});
                            if (mVal.stop == true)
                                break;
                        }
                    }

                } else {
                    validationMessages.push({field:mKey, message: "onValidate is not implemented in validator : " + mVal.plugin});
                }
            } else {
                validationMessages.push({field:mKey, message: "validation plugin not found : " + mVal.plugin});
            }
        }

        return validationMessages.length ==0 ? undefined : validationMessages;
    }

}