declare let console:any;

export class SteroidMapperException {
    public errorMessage: string;

    constructor(msg: string){
        this.errorMessage = msg;
    }
}

export class AppendOps{

    private _obj:any;
    private _field:string;
    private _mapper:SteroidsMapper;

    constructor(obj:any, field: string, mapper: SteroidsMapper){
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

export class MapOps{

    private _obj:any;
    private _fields:string[];
    private _mapper:SteroidsMapper;

    constructor(obj:any, fields: string[], mapper: SteroidsMapper){
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

export class RenOps {
    private _obj;
    private _srcFields:string[];
    private _mapper:SteroidsMapper;

    constructor(obj:any, srcFields: string[], mapper: SteroidsMapper){
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

export class SteroidsMapper {
    
    private _obj;

    constructor(obj:any){
        this._obj = obj;
    }

    append (field:string) : AppendOps{
        if (field === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept undefined value for the append() function");

        return new AppendOps(this._obj, field,this);
    }

    map(fields: any) : MapOps{

        if (fields === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the map() function");

        fields = fields instanceof Array ? fields : [fields];

        if (!fields.isInstanceOf("string"))
            throw new SteroidMapperException("Steroids mapper doesn't accept non string values as field names for the map() function");

        return new MapOps(this._obj, fields,this);
    }

    move(fields: string[]) : MoveOps{
        return new MoveOps(this._obj, fields,this);
    }

    rename (fields = undefined) : RenOps {
        if (fields === undefined)
            fields = [];
        return new RenOps(this._obj, fields,this);
    }

    delete(fields: any){
        
        if (fields === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the delete() function");

        let obj = this._obj instanceof Array? this._obj : [this._obj];
        fields = fields instanceof Array? fields : [fields];

        for (let i=0;i<fields.length;i++)
            if (typeof (fields[i]) !== "string" )
                throw new SteroidMapperException("Steroids mapper doesn't non string values for the delete() function");

        for (let i=0;i<obj.length;i++){
            let cobj = obj[i];
            
            for(let k=0;k<fields.length;k++)
                if (cobj[fields[k]] !== undefined)
                    delete cobj[fields[k]];

        }

        return this;
    }

    mixin (destObj:any){
        if (destObj !== undefined)
        if (typeof destObj === "object")
        for(let name in destObj){
            this._obj[name] = destObj[name];
        }

        return this._obj;
    }
}