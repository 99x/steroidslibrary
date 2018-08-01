import {ISteroidPlugin} from "./ISteroidPlugin"
import {PluginType} from "./PluginType"
import {AbstractSteroidPlugin} from "./AbstractSteroidPlugin"
import {Steroid} from "../Steroids"

export class PluginManager {

    private static _pluginList = {}; 

    public static register(plugin: {new()}){
        let plugInstance = new plugin();
        let info:ISteroidPlugin = plugInstance.onRegister();
        let pl = PluginManager._pluginList;
        if (!pl[info.type])
            pl[info.type] = {};

        pl[info.type][info.key] = plugInstance;
    }

    public static getInstance(steroid:Steroid, pluginType:PluginType, key:string, parameters?: any) {
        let plugInstance = undefined;

        let pl = PluginManager._pluginList;

        if (pl[pluginType])
        if (pl[pluginType][key]){
            let absPlugin:AbstractSteroidPlugin = pl[pluginType][key];
            try {
                if (parameters)
                    plugInstance = absPlugin.getInstance(steroid,parameters);
                else
                    plugInstance = absPlugin.getInstance(steroid);
            }catch (e){
                throw {message : `Error creating an instance of plugin ${pluginType}.${key}`  , exception: e}
            }
        }

        if (!plugInstance)
            throw {message : `plugin not installed or registered : ${pluginType}.${key}` }

        return plugInstance;
    }
}