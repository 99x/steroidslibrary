export enum LogType
{
    System,
    Logic,
    Error
}


export class ActivityLogger 
{
    private _logs = [];

    public log(message: string, type:LogType){
        if (!type)
            type = LogType.Logic;
        var time = new Date();
        this._logs.push({time:time, type: type, message: message});
    }

    public getLogs(){
        return this._logs;
    }
}