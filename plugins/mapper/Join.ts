import {SteroidsMapper} from "./SteroidsMapper"
import {SteroidMapperException} from "./SteroidMapperException"
import {ValueRetriever} from "../../helpers/ValueRetriever"

export class JoinOps {

    private _obj:any;
    private _currentConfig:any =  {};
    private _joinConfigs = [this._currentConfig];
    private _mapper:SteroidsMapper;

    constructor(obj:any, dataset:any, mapper: SteroidsMapper){            
        this._obj = obj;
        this._currentConfig.dataset = dataset;
        this._mapper = mapper;
    }

    public on(mainObjectField:string, dataSetField:string){
        this._currentConfig.mainField = mainObjectField;
        this._currentConfig.dataSetField = dataSetField;
    }   

    public to(...fields:string[]){
        this._performJoin(fields);
        return this._mapper;
    } 

    public join(dataset:any){
        this._currentConfig = {dataset:dataset};
        this._joinConfigs.push(this._currentConfig);
    }

    private _performJoin(fields:string[]){
        let joinObjs;
        if (this._obj instanceof Array)
            joinObjs = this._obj;
        else
            joinObjs = [this._obj];

        
        for (let i=0;i<joinObjs;i++){
            let mainObj = joinObjs[i];

            for (let j=0;j<this._joinConfigs.length;j++){
                let {dataset,mainField,dataSetField} = this._joinConfigs[j];
                let fieldName = fields [j];

                let bindValues = dataset.filter((obj)=>{
                    let isValid = false;
                    if (obj)
                    if (obj[dataSetField] && mainObj[mainField])
                    if (obj[dataSetField] == mainObj[mainField])
                        isValid = true;
                    return isValid;
                });

                mainObj[fieldName] = bindValues;
            }
        }
    }
}