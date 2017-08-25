export abstract class Flask {
    
    private static containerSettings:any = {};
    private static singletonObjects:any = {};
    private static isInitialized:boolean = false;
    public static inject(type: any) {
        return {
            to: (fieldName:string)=>{
                Flask.containerSettings[fieldName] = type;
            }
        }
    }

    public static initialize() {
        //if (Flask.isInitialized)
        //    return;

        Flask.createSingletonObjects();

        Flask.isInitialized = true;
    }

    public static reinitialize() {
        Flask.createSingletonObjects();
    }

    private static createSingletonObjects(){
        let injectQueue = [];
        for (let fieldName in Flask.containerSettings){
            //if (Flask.singletonObjects[fieldName] === undefined){
                let objType:any = Flask.containerSettings[fieldName];
                let newObj;

                if (typeof objType === 'function')
                    newObj = new objType();
                else
                    newObj = objType;

                injectQueue.push(newObj);
                Flask.singletonObjects[fieldName] = newObj;
            //}
        }

        for (let i=0;i< injectQueue.length;i++)
        if (injectQueue[i].inject !== undefined)
            injectQueue[i].inject();
    }

    public inject(){
        for (let fieldName in Flask.singletonObjects){
            this[fieldName] = Flask.singletonObjects[fieldName];
        }
    }
}