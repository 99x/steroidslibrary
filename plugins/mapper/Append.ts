import {SteroidsMapper} from "./SteroidsMapper"
import {SteroidMapperException} from "./SteroidMapperException"

export class AppendOps {

    private _obj:any;
    private _field:string;
    private _mapper:SteroidsMapper;

    constructor(obj:any, field: string, mapper: SteroidsMapper){
        if (field === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept undefined value for the append() function");
            
        this._obj = obj;
        this._field = field;
        this._mapper = mapper;
    }

    private async appendObject(obj:any, func: Function){
        let modifiedVal = await func(obj);
        obj[this._field] = modifiedVal;
    }

    async from(appendFunc: Function){
        if (appendFunc === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the from() function, should be a function");

        if (this._obj instanceof Array){
            for (let i=0;i<this._obj.length;i++)
                await this.appendObject(this._obj[i], appendFunc);
        }else
            await this.appendObject(this._obj, appendFunc);
        
        return this._mapper;
    }

    async fromAsync(appendFunc: Function) {
        if (appendFunc === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the from() function, should be a function");

        if (this._obj instanceof Array){
            let asyncArr = [];
            for (let i=0;i<this._obj.length;i++)
                asyncArr.push(this.appendObject(this._obj[i], appendFunc));
            
            await Promise.all(asyncArr);
        }else
            await this.appendObject(this._obj, appendFunc);
        
        return this._mapper;
    }
}