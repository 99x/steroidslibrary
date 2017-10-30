import {Steroid} from "./Steroids"

export let Config = {};

export function updateConfig(config:any){
    for (let key in config)
        Config[key] = config[key];
}

export function setConfig (config:any){
    for (let key in config)
        delete Config[key];
    
    updateConfig(config);
    delete Steroid.globalConfig.configFileName;
}