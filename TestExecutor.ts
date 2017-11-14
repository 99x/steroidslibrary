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
            let iterator = new AsyncIterator (fileList,{});
            iterator.onComplete((results:any[])=>{
                resolve(results);
            });

            iterator.onCompleteOne((success:boolean, result:any)=>{
                this.printResults("");
            })

            iterator.logic((element,inObj, ctrl)=>{
                try {
                    let moduleObj = require(element);
                    moduleObj._handler
                    .then((result)=>{
                        ctrl(element);
                    })
                    .catch((e)=>{
                        ctrl(e);
                    })

                }catch (e){
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
            
            let hasError = false
            if (hasError){
                console.log ("Some unit tests have failed!!!");
                process.exit(3);
            }
            else{
                console.log ("All the unit tests have passed!!!");
                process.exit(0);
            }
        }).catch((err)=>{
            console.log ("Execution error : " , err);
        });

    }
}

