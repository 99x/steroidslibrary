import {Flask} from "./Flask"
import {AsyncIterator} from "./helpers/AsyncIterator"

declare function require(module:string);
declare let console:any;

//function describe(name,func){func();}
//function it(name,func):any{try{func(function(){});}catch(e){} return {timeout:()=>{}}}

declare function it(label:string, func:Function);
declare function describe(label:string, func:Function);

require("mocha");

export function feature(value:string){
    return function(target){
        TestRunner.setMetadata(target.name,"__feature","value", value);
    }
}

export function jiraTask(value:string){
    return function(target){
        TestRunner.setMetadata(target.name,"__jiratask","value", value);
    }
}

export function asyncTest(){
    return function(target:any, propertyKey, descriptor: PropertyDescriptor){
        TestRunner.setMetadata(target.constructor.name,propertyKey,"isAsync", true);
    }
}

export function scenario(value:string){
    return function(target:any, propertyKey: string, descriptor: PropertyDescriptor){
        TestRunner.setMetadata(target.constructor.name,propertyKey,"scenario", value);
    }
}

export function outcome(value:string){
    return function(target:any, propertyKey: string, descriptor: PropertyDescriptor){
        TestRunner.setMetadata(target.constructor.name,propertyKey,"thentext", value);
    }
}


export class TestRunner {

    private static _metadata = {};

    public static setMetadata(className, method, key, value){
        
        if (TestRunner._metadata[className] === undefined)
            TestRunner._metadata[className] = {};

        if (TestRunner._metadata[className][method] === undefined)
            TestRunner._metadata[className][method] = {};
        
        TestRunner._metadata[className][method][key] = value;
    }

    public static getMetadata(className, method){
        if (TestRunner._metadata[className] !== undefined)
        if (TestRunner._metadata[className][method] !== undefined)
            return TestRunner._metadata[className][method];
    }

    public static getMetadataForClass(className){
        return TestRunner._metadata[className];
    }

    public static getAllMetadata(){
        return TestRunner._metadata;
    }

    private static getScenarioMethods(className){
        let outData = [];
        let metdata = TestRunner._metadata[className];
        if (metdata != undefined){
            for (let key in metdata){
                if (!key.startsWith("__"))
                    outData.push(key);
            }
        }
        
        return outData;
    }

    public static run(arr:any): Promise<any>{
        Flask.initialize();

        if (arr instanceof Array){
            let promiseArray = [];
            arr.forEach((item)=>{
                let pObj = TestRunner._run(new item());    
                promiseArray.push(pObj);
            });
            return Promise.all(promiseArray);

        } else {
            return TestRunner._run(new arr());
        }
    }

    private static _run (typeObj: any): Promise<any>{
        return new Promise<any>((mainResolve,mainReject)=>{
            if (typeObj.inject !== undefined)
                typeObj.inject();

            let metadataClass = TestRunner.getMetadataForClass(typeObj.constructor.name);
            if (metadataClass == undefined)
                return;

            let methods = TestRunner.getScenarioMethods(typeObj.constructor.name);
            let feature = metadataClass["__feature"];
            feature = (feature == undefined) ? typeObj.constructor.name : feature.value;
            let jiraTask = metadataClass["__jiratask"];
            jiraTask = (jiraTask == undefined) ? "" : "(" + jiraTask.value + ") ";

            let resultObject = {feature: feature, jiraTask:jiraTask, scenarios:[]};

            let iterator = new AsyncIterator(methods, {});
            
            iterator.logic((attributeKey,inObj, asyncDone)=>{
                if (typeObj[attributeKey] !== undefined)
                if (typeof typeObj[attributeKey] === "function"){
                    let metadata = TestRunner.getMetadata(typeObj.constructor.name, attributeKey);
                    let scenario:string = metadata.scenario == undefined ? "UNKNOWN SCENARIO" : metadata.scenario;
                    let isAsync:boolean = metadata.isAsync == undefined ? false : metadata.isAsync;
                    let scenarioText = "Scenario : " + scenario;

                    let controller:any = (function(thentext,scenario){
                        let lastFunc = "given";
                        
                        let scenarioObj = {name:scenario, given:[],when:[],then:[]};
                        if (thentext!==undefined)
                            scenarioObj.then.push({message: "Outcome: " + thentext});
                        
                        let lastThen:any = scenarioObj.then.length > 0 ? scenarioObj.then[scenarioObj.then.length-1]: {};


                        function write (text, tag, hideCaption = false){
                            if (!hideCaption){
                                scenarioObj[lastFunc].push(tag + " : " + text)
                            }
                        }

                        let controllerMethods = {
                            given: function(text, hideCaption){
                                lastFunc = "given";
                                write(text,"Given", hideCaption);
                            },
                            when: function(text, hideCaption){
                                lastFunc = "when";
                                write(text,"When", hideCaption);
                            },
                            then: function(text, hideCaption){
                                if (thentext !== undefined)
                                    return;
                                lastFunc = "then";
                                write("","Then", hideCaption);
                            },
                            and: function(text){
                                write(text,"And");
                                controllerMethods[lastFunc](text,true);
                            },
                            logError: function (e){
                                lastThen.exception = e;
                            },
                            getScenarioObject: function(){
                                return scenarioObj;
                            }
                        };

                        return controllerMethods;
                    })(metadata.thentext,scenarioText);

                    
                    if (isAsync){
                        
                        try {
                            let promiseObj = typeObj[attributeKey](controller.given,controller.when,controller.then,controller.and);
                            promiseObj
                            .then(()=>{
                                asyncDone(controller.getScenarioObject());
                            })
                            .catch((e)=>{
                                controller.logError(e);
                                asyncDone(controller.getScenarioObject());
                            });
                        }
                        catch (e){
                            controller.logError(e);
                            asyncDone(controller.getScenarioObject());
                        }
                    }else {
                        try{
                            typeObj[attributeKey](controller.given,controller.when,controller.then,controller.and);
                        }
                        catch (e){
                            console.log(e);
                            controller.logError(e);
                        }
                        asyncDone(controller.getScenarioObject());
                    }
                }
                
            });

            iterator.onCompleteOne((scenario)=>{
                resultObject.scenarios.push(scenario)
            });

            iterator.onComplete(()=>{
                let rObj = resultObject;
                
                console.log ("Feature " + rObj.jiraTask + ": "  + rObj.feature);
                rObj.scenarios.forEach((scenario)=>{
                    console.log ("\t" + scenario.name);

                    let caption = "";

                    scenario.given.forEach(txt => {caption += txt;});
                    scenario.when.forEach(txt => {caption += txt;});
                    
                    if (caption)
                        console.log ("\t\t" + caption);

                    for (let i=0;i<scenario.then.length;i++){
                        let thenFunc = scenario.then[i];
                        console.log ("\t\t\t" + thenFunc.message);
                        if (thenFunc.exception)
                        console.log ("\t\t\t\t" + thenFunc.exception);
                    }
                });
                console.log ("\n\n");
                mainResolve(resultObject);
            });

            iterator.start();            
        });

    }
}
