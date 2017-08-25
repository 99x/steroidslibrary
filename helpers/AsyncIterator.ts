declare let console:any;
export class AsyncIterator {

    private _arr:any[];
    private _index = -1;
    private _cbLogic;
    private _cbComplete;
    private _controller;
    private _cbCompleteOne;
    private _inObject;

    constructor(arr: any[], inObject: any){
        this._arr = arr;
        this._inObject  = inObject;
    }

    private next(){
        this._index++;
        if (this._index == this._arr.length)
            this._cbComplete(this._inObject);
        else
            this._cbLogic(this._arr[this._index], this._inObject,this._controller);
    }

    logic (logicFunc: Function){
        this._cbLogic = logicFunc;
    }

    onComplete(compFunction: Function){
        this._cbComplete = compFunction;
    }

    onCompleteOne(compFunction:Function){
        this._cbCompleteOne = compFunction;
    }

    start(){
        var self = this;
        this._controller = (response)=>{
            if (self._cbCompleteOne)
                self._cbCompleteOne(response);
            self.next();
        }
        this.next();
    }   
}