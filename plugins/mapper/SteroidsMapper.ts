import {SteroidMapperException} from "./SteroidMapperException"
import {AppendOps} from "./Append"
import {MapOps} from "./Map"
import {RenOps} from "./Rename"
import {MoveOps} from "./Move"
import {MixinOps} from "./Mixin"
import {DeleteOps} from "./Delete"
import {JoinOps} from "./Join"

declare let console:any;

export class SteroidsMapper {
    
    private _obj;

    constructor(obj:any){
        this._obj = obj;
    }

    append (field:string) : AppendOps{
        return new AppendOps(this._obj, field,this);
    }

    map(fields: any) : MapOps{
        return new MapOps(this._obj, fields,this);
    }

    move(fields: string[]) : MoveOps{
        return new MoveOps(this._obj, fields,this);
    }

    rename (fields = undefined) : RenOps {
        return new RenOps(this._obj, fields,this);
    }

    join (dataset:any): JoinOps {
        return new JoinOps(this._obj, dataset, this);
    }

    delete(fields: any){
        return DeleteOps.delete(this,fields, this._obj);
    }

    mixin (destObj:any){
        return MixinOps.mixin(this._obj,destObj);
    }
}