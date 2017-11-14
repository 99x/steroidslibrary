import {ParallelIterator,IIteratorController} from "steroidslibrary/helpers/ParallelIterator"
import {AsyncIterator} from "steroidslibrary/helpers/AsyncIterator"

declare function require(module:string):any;
declare let console:any;
declare let process:any;
declare let v8debug:any;

class SteroidsTestEngine {
    
    private _basePath;

    constructor (basePath:string){
        this._basePath = basePath;
    }

    private getUnitTestFiles(): string[]{
        const fs = require('fs');
        const path = require('path');
        let filesToReturn = [];
        function walkDir(currentPath) {
            let files = fs.readdirSync(currentPath);
            for (let i in files) {
                var curFile = path.join(currentPath, files[i]);      
                if (fs.statSync(curFile).isFile() && curFile.endsWith(".tests.js")) {
                    filesToReturn.push(curFile);
                } else if (fs.statSync(curFile).isDirectory()) {
                    walkDir(curFile);
                }
            }
        };
        walkDir(this._basePath);
        return filesToReturn;
    }

    private printResults(results:string){

    }

    start(): Promise<any>{
        const child_process = require('child_process');
        
        return new Promise<any>((resolve,reject)=>{
            let fileList = this.getUnitTestFiles();
            let iterator = new AsyncIterator (fileList,{results:[]});
            iterator.onComplete((results:any)=>{
                resolve(results.results);
            });

            iterator.onCompleteOne((success:boolean, result:any)=>{
                this.printResults("");
            })

            iterator.logic((element,inObj, ctrl)=>{
                try {
                    let moduleObj = require(element);
                    moduleObj._handler
                    .then((result)=>{
                        inObj.results.push({validFormat:true, result:result});
                        ctrl(element);
                    })
                    .catch((e)=>{
                        inObj.results.push({validFormat:false, result:e});
                        ctrl(e);
                    })

                }catch (e){
                    inObj.results.push({validFormat:false, result:e});
                    ctrl(e);
                }
                
            });

            iterator.start();

        });
    }

}

export class TestExecutor {

    public static execute(basePath:string){
        let executor = new SteroidsTestEngine(basePath);
        
        executor.start().then((results)=>{
            
            let passCount = 0;
            let failCount = 0;


            for (let i=0;i<results.length;i++){
                let r = results[i];
                if (r.validFormat){
                    let scenarios = r.result.scenarios;

                    for (let j=0;j<scenarios.length;j++){
                        let scenario = scenarios[j];
                        for (let k=0;k<scenario.then.length;k++){
                            let t = scenario.then[k];
                            if (t.exception)
                                failCount++;
                            else
                                passCount++;
                        }
                    }
                }else {
                    failCount++;
                }
            }


            console.log ("\x1b[32m","Number of success unit test cases : " + passCount, "\x1b[0m");
            
            if (failCount > 0)
                console.log ("\x1b[31m", "Number of failed unit test cases : " + failCount, "\x1b[0m");

            if (failCount > 0){
                process.exit(3);
            }
            else{
                process.exit(0);
            }
        }).catch((err)=>{
            console.log ("Execution error : " , err);
        });

    }
}

