export class MixinOps {
    public static mixin (_obj:any, destObj:any){
        if (destObj !== undefined)
        if (typeof destObj === "object")
        for(let name in destObj){
            _obj[name] = destObj[name];
        }

        return _obj;
    }
}