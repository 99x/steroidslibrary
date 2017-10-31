import {ISteroidPlugin} from "./ISteroidPlugin"
import {Steroid} from "../Steroids"

export abstract class AbstractSteroidPlugin {
    public abstract onRegister(): ISteroidPlugin;

    public abstract getInstance(steroid:Steroid):any;
}