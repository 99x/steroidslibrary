export class ValueRetriever {
    
    public static getValue(obj:any, path:string){
        let value = undefined;

        if (obj && path){
            let parts;

            if (path.includes("."))
                parts = path.split(".");
            else
                parts = [];
            
            value = obj;
                
            for (let i=0;i<parts.length;i++){
                value = value[parts[i]];

                if (value == undefined || value == null)
                    break;
            }
        }

        return value;
    }

}