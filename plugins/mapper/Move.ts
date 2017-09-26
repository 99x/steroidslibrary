import {SteroidsMapper} from "./SteroidsMapper"
import {SteroidMapperException} from "./SteroidMapperException"

export class MoveOps{

    private _obj:any;
    private _fields:string[];
    private _mapper:SteroidsMapper;

    constructor(obj:any, fields: string[], mapper: SteroidsMapper){
        this._obj = obj;
        this._fields = fields;
        this._mapper = mapper;
    }

    private moveObject(obj: any, field:string){
        let destObj;

        if (field.includes(".")){
            let fieldData = field.split(".");
            destObj = obj;
            for (let i=0;i<fieldData.length;i++){
                let cField = fieldData[i];
                if (!destObj[cField])
                    destObj[cField] = {};
                destObj = destObj[cField];
            }
        }
        else {
            if (!obj[field])
                obj[field] = {};
            destObj = obj[field];
        }
        
        for (let i=0;i<this._fields.length;i++){
            let cField = this._fields[i];
            let srcObj = obj[cField];
            if (srcObj !== undefined){
                destObj[cField] = srcObj;
                delete obj[cField];
            }
        }
    }

    to(field: string){
        if (this._obj instanceof Array){
            for (let i=0;i<this._obj.length;i++)
                this.moveObject(this._obj[i], field);
        }else
            this.moveObject(this._obj, field);

        return this._mapper;
    }

    toIndex(index: number):any[]{
        let newObjs = [];
        
        for (let i=0;i<this._obj.length;i++){
            let newObj = {};
            let obj = this._obj[i];
            let count = 0;
            for (let key in obj){
                count++;
                if (count == index)
                    newObj[this._fields[0]] = obj[this._fields[0]];

                if (key !== this._fields[0])
                    newObj[key] = obj[key];
            }

            newObjs.push(newObj);
        }

        return newObjs;
    }


    private sortObject(obj:any, sortOrder:string[]){
        let tempObj = {};
        for (let i=0;i<sortOrder.length;i++){
            let key = sortOrder[i];
            if (obj[key] !== undefined){
                tempObj[key] = obj[key];
                delete obj[key];
            }
        }

        for (let key in obj){
            tempObj[key] = obj[key]
            delete obj[key];
        }

        for (let key in tempObj)
            obj[key] = tempObj[key];
    }

    inThisOrder(){
        if (this._obj instanceof Array){
            for (let i=0;i<this._obj.length;i++)
                this.sortObject(this._obj[i], this._fields);
        } else
            this.sortObject(this._obj, this._fields);

        return this._mapper;
    }
}