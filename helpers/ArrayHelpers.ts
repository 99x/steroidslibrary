function addHelperMethods(){
    let protoObj:any = Array.prototype;
    protoObj.first = function () {
        if (this.length > 0)
            return this[0];
    }

    protoObj.firstOrDefault = function (defVal) {
        if (this.length > 0)
            return this[0];
        else
            return defVal;
    }

    protoObj.isInstanceOf = function (type: string) {
        let isOk = true;
        for (let i=0;i<this.length;i++)
        if (typeof this[i] !== type){
            isOk = false;
            break;
        }

        return isOk;
    }

}

export class ArrayHelpers {
    public static initialize(){
        addHelperMethods();
    }
}
