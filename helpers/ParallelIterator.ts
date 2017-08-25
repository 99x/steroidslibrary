export interface IIteratorController {
    success(result:any);
    fail(result:any);
    index:number;
    element:any;
}

export class ParallelIterator {
    private maxProcesses:number;
    private queue:any[];
    private currentIndex = -1;
    private callbacks:any;
    private results:any;
    private completedAmount = 0;

    constructor (maxProcesses:number, queue: any[]){
        this.callbacks = {};
        this.results = {};
        this.maxProcesses = maxProcesses;
        this.queue = queue;
    }

    public onComplete(callback:(results:any[])=>void){
        this.callbacks.onComplete = callback;
    }

    public onCompleteOne(callback: (success:boolean, result:any)=>void){
        this.callbacks.onCompleteOne = callback;
    }

    public logic(logicFunction:(ctrl: IIteratorController)=>void){
        this.callbacks.logic = logicFunction;
    }

    private dequeue(){
        this.currentIndex++;

        if (this.completedAmount == this.queue.length)
            if (this.callbacks.onComplete !== undefined)
                this.callbacks.onComplete(this.results);

        if (this.currentIndex < this.queue.length){
            
            if (this.callbacks.logic !== undefined) {
                var self = this;
                let controllerObj = ((index,element)=>{

                    let result:IIteratorController = {
                        success:(result:any)=>{
                            this.completedAmount++;
                            self.results[index] = {success: true, result:result};
                            if (self.callbacks.onCompleteOne !== undefined)
                                self.callbacks.onCompleteOne(true, result);
                            self.dequeue();
                        },
                        fail:(result:any)=>{
                            this.completedAmount++;
                            self.results[index] = {success: false, result:result};
                            if (self.callbacks.onCompleteOne !== undefined)
                                self.callbacks.onCompleteOne(false, result);
                            self.dequeue();
                        },
                        index: index,
                        element:element
                    }
                    return result;
                })(this.currentIndex, this.queue[this.currentIndex]);

                this.callbacks.logic(controllerObj);
            }
        }
    }

    public start(){
        for (let i=0;i<this.maxProcesses;i++)
            this.dequeue();
    }
}