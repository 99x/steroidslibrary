export let Config = {};

export function updateConfig(config:any){
    for (let key in config)
        Config[key] = config[key];
}