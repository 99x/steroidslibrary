import {PluginType} from "./PluginType"

export interface ISteroidPlugin {
    type: PluginType;
    name:string;
    key: string;
}