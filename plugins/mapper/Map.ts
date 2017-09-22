import {SteroidsMapper} from "./SteroidsMapper"
import {SteroidMapperException} from "./SteroidMapperException"

export class MapOps{

    private _obj:any;
    private _fields:string[];
    private _mapper:SteroidsMapper;

    constructor(obj:any, fields: any, mapper: SteroidsMapper){
        if (fields === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the map() function");

        fields = fields instanceof Array ? fields : [fields];

        if (!fields.isInstanceOf("string"))
            throw new SteroidMapperException("Steroids mapper doesn't accept non string values as field names for the map() function");

        this._obj = obj;
        this._fields = fields;
        this._mapper = mapper;
    }

    private castObject(obj:any, func: Function){
        for (let i=0;i<this._fields.length;i++){
            let fieldName = this._fields[i]
            let modifiedVal = func(obj[fieldName]);
            if (obj[fieldName] !== undefined && modifiedVal !== undefined){
                obj[fieldName] = modifiedVal;
            }
        }
    }

    to(castFunc: Function){
        if (castFunc == undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the to() function, should be a function");

        if (this._obj instanceof Array){
            for (let i=0;i<this._obj.length;i++)
                this.castObject(this._obj[i], castFunc);
        }else
            this.castObject(this._obj, castFunc);
        
        return this._mapper;
    }
}