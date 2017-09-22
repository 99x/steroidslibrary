import {SteroidsMapper} from "./SteroidsMapper"
import {SteroidMapperException} from "./SteroidMapperException"

export class RenOps {
    private _obj;
    private _srcFields:string[];
    private _mapper:SteroidsMapper;

    constructor(obj:any, srcFields: string[], mapper: SteroidsMapper){
        if (srcFields === undefined)
            srcFields = [];

        this._obj = obj;
        this._srcFields = srcFields;
        this._mapper = mapper;
    }

    private renameFields(obj:any, destFields:string[]){
        
        for (let i=0;i<this._srcFields.length;i++){
            let cObj = obj;
            let fName = this._srcFields[i];
            
            if (fName.includes(".")){
                let splitData = fName.split(".");
                for (let j=0;j<splitData.length;j++){
                    fName = splitData[j];
                    
                    if (j != (splitData.length -1))
                        cObj = cObj[fName];

                    if (cObj == undefined)
                        break;
                }
            }
            
            if (cObj!==undefined)
            if (cObj[fName] !== undefined){
                cObj[destFields[i]]  = cObj[fName];
                delete cObj[fName];
            }
        }
    }

    public to (destFields: string[]){
        if (this._obj instanceof Array){
            for (let i=0;i<this._obj.length;i++)
                this.renameFields(this._obj[i], destFields);
        }else
            this.renameFields(this._obj, destFields);
        
        return this._mapper;
    }

    public toUpperFirst(path = undefined){
        let destFields = [];
        if (path == undefined){
            let obj = this._obj instanceof Array? this._obj[0] : this._obj;

            for (let fKey in obj){
                let ucText = fKey.charAt(0).toUpperCase() + fKey.slice(1);;
                this._srcFields.push(fKey);
                destFields.push(ucText);
            }
        }

        return this._mapper;
    }
}