import {SteroidsMapper} from "./SteroidsMapper"
import {SteroidMapperException} from "./SteroidMapperException"

export class DeleteOps {
    public static delete(mapper: SteroidsMapper, fields:any, _obj:any){

        if (fields === undefined)
            throw new SteroidMapperException("Steroids mapper doesn't accept null values for the delete() function");

        let obj = _obj instanceof Array? _obj : [_obj];
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

        return mapper;
    }
}