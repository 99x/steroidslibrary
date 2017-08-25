import {TestRunner, scenario, outcome, feature, jiraTask } from "../../TestRunner"
import {MapOps,AppendOps, SteroidsMapper, SteroidMapperException} from "../../helpers/SteroidsMapper"

declare function require(module:string):any;
let assert = require("assert");

@feature("Steroids Mapper -> Mixins")
@jiraTask("PLAT-123")
class MixinTest {

    @scenario("Developer passes undefined value for the mixin function")
    @outcome("Mixin function should return the same object")
    public scenario_1(given,when,then,and){
       
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);
            let resultObject = mapper.mixin(undefined);
            assert.equal(srcObj, resultObject);
    }

    @scenario("Developer passes string value for the mixin function")
    @outcome("Mixin function should return the same object")
    public scenario_2(given,when,then,and){
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);
            let resultObject = mapper.mixin("test strinng");
                
            assert.equal(srcObj, resultObject);
    }

    @scenario("Developer passes a non string array for the mixin function")
    @outcome("Mixin function should return the same object")
    public scenario_3(given,when,then,and){  
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);
            let resultObject = mapper.mixin([1,2,3]);
        
            assert.equal(srcObj, resultObject);
    }

    @scenario("Developer passes an object for the mixin function")
    @outcome("Mixin function should return the same object")
    public scenario_4(given,when,then,and){
            let srcObj:any = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);
            let mixinObject = {address: "colombo", phone:"1234567890"};
            let resultObject = mapper.mixin(mixinObject);
        
            assert.equal(srcObj.address, mixinObject.address);
            assert.equal(srcObj.phone, mixinObject.phone);
    }
}

@feature("Steroids Mapper -> Mapping")
@jiraTask("PLAT-124")
class MapTest {

    @scenario("Developer passes a undefined value for the map function")
    @outcome("The map() method should throw an exception")
    public scenario_1(given,when,then,and){
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);

            assert.throws(() => {
                let mapObj = mapper.map(undefined);
            },SteroidMapperException);
    }

    @scenario("Developer passes a numeric value for the map function")
    @outcome("The map() method should throw an exception")
    public scenario_2(given,when,then,and){
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);

            assert.throws(() => {
                let mapObj = mapper.map(123);
            },SteroidMapperException);
    }

    @scenario("Developer passes a boolean value for the map function")
    @outcome("The map() method should throw an exception")
    public scenario_3(given,when,then,and){
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);

            assert.throws(() => {
                let mapObj = mapper.map(true);
            },SteroidMapperException);
    }

    @scenario("Developer passes an array of numeric values for the map function")
    @outcome("The map() method should throw an exception")
    public scenario_4(given,when,then,and){
            let srcObj = {id:1, firstName:"supun"};
            let mapper = new SteroidsMapper(srcObj);

            assert.throws(() => {
                let mapObj = mapper.map([1,2,3,4,5]);
            },SteroidMapperException);
    }

}

TestRunner.run([MixinTest,MapTest]);