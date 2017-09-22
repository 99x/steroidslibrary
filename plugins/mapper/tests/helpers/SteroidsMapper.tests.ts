import "mocha"
declare function require(module:string):any;
declare let console:any;
let assert = require("assert");

import {SteroidsMapper} from "../../SteroidsMapper"
import {SteroidMapperException} from "../../SteroidMapperException"
import {MapOps} from "../../Map"
import {AppendOps} from "../../Append"


describe("Component : Steroids Mapper", () => {
    
    describe("Feature: Mixins", () => {
        
        beforeEach(()=>{
            this.srcObj = {id:1, firstName:"supun"};
            this.mapper = new SteroidsMapper(this.srcObj);
        });

        describe("Scenario: Developer passes a non object for the mixin function", () => {          
            it("Mixin function should return the same object for a undefined value", () => { 
                let mapper:SteroidsMapper = this.mapper;
                
                let resultObject = mapper.mixin(undefined);

                assert.equal(this.srcObj, resultObject);
            });
            
            it("Mixin function should return the same object for a string value", () => { 
                let mapper:SteroidsMapper = this.mapper;
                
                let resultObject = mapper.mixin("test strinng");

                assert.equal(this.srcObj, resultObject);
            });

            it("Mixin function should return the same object for an array", () => { 
                let mapper:SteroidsMapper = this.mapper;
                
                let resultObject = mapper.mixin([1,2,3]);

                assert.equal(this.srcObj, resultObject);
            });
        });

        describe("Scenario: Developer passes an object for the mixin function", () => {          
            it("The original object should be modified", () => { 
                let mapper:SteroidsMapper = this.mapper;
                let mixinObject = {address: "colombo", phone:"1234567890"};
                
                let resultObject = mapper.mixin(mixinObject);

                assert.equal(this.srcObj.address, mixinObject.address);
                assert.equal(this.srcObj.phone, mixinObject.phone);
            });
           
        });
    });

    describe("Feature: Mapping", () => {
        
        beforeEach(()=>{
            this.srcObj = {id:1, firstName:"supun"};
            this.mapper = new SteroidsMapper(this.srcObj);
        });

        describe("Scenario: Developer passes a non object for the map function", () => {          

            it("The map() method should throw an exception for an undefined value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map(undefined);
                },SteroidMapperException);
            });

            it("The map() method should throw an exception for a numeric value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map(123);
                },SteroidMapperException);
            });

            it("The map() method should throw an exception for a boolean value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map(true);
                },SteroidMapperException);
            });

            it("The map() method should throw an exception for a array of numeric values", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map([1,2,3,4,5]);
                },SteroidMapperException);
            });

        });

        describe("Scenario: Developer passes a string, or an array of strings for the map function", () => {          

            it("The map() method should return a controller object when a string is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                let controllerObject = mapper.map("id");

                assert.equal(controllerObject instanceof MapOps, true);
            });

            it("The map() method should return a controller object when a string array is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                let controllerObject = mapper.map(["id","name"]);

                assert.equal(controllerObject instanceof MapOps, true);
            });


            it("When a function is passed to the to() function the value of the field should be modified", () => { 
                let mapper:SteroidsMapper = this.mapper;

                mapper.map("id").to((value)=> value + 1);

                assert.equal(this.srcObj.id, 2);
            });

            it("When an undefined value is passed to the to() function should throw an exception", () => { 
                let mapper:SteroidsMapper = this.mapper;              

                assert.throws(() => {
                    mapper.map("id").to(undefined);
                },SteroidMapperException);
            });
        });

    });

    describe("Feature: Appending", () => {
        
        beforeEach(()=>{
            this.srcObj = {id:1, firstName:"supun"};
            this.mapper = new SteroidsMapper(this.srcObj);
        });

        describe("Scenario: Developer passes a non object for the append() function", () => {          

            it("The append() method should throw an exception for an undefined value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.append(undefined);
                },SteroidMapperException);
            });

        });

        describe("Scenario: Developer passes a string for the append() function", () => {          

            it("The append() method should return a controller object when a string is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                let controllerObject = mapper.append("id");

                assert.equal(controllerObject instanceof AppendOps, true);
            });

            it("When an undefined value is passed to the from() function should throw an exception", (done) => { 
                let mapper:SteroidsMapper = this.mapper;              

                mapper.append("id").from(undefined)
                .then(()=>{done()})
                .catch((e)=>{
                    assert.throws(() => {
                        throw e;
                    },SteroidMapperException);
                    done();
                });

            });

            it("When a function is passed to the from() function the value of the field should be modified", async () => { 
                let mapper:SteroidsMapper = this.mapper;

                await mapper.append("newField").from((obj)=> "modified");

                assert.equal(this.srcObj.newField, "modified");
            });

        });

    });

    describe("Feature: Deleting", () => {
        
        beforeEach(()=>{
            this.srcObj = {id:1, firstName:"supun"};
            this.mapper = new SteroidsMapper(this.srcObj);
        });

        describe("Scenario: Developer passes a non object for the delete function", () => {          

            it("The delete() method should throw an exception for an undefined value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.delete(undefined);
                },SteroidMapperException);
            });

            it("The delete() method should throw an exception for a numeric value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.delete(123);
                },SteroidMapperException);
            });

            it("The delete() method should throw an exception for a boolean value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.delete(true);
                },SteroidMapperException);
            });

            it("The delete() method should throw an exception for a array of numeric values", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.delete([1,2,3,4,5]);
                },SteroidMapperException);
            });
        });

        describe("Scenario: Developer passes a string, or array of string for the delete function", () => {          

            it("The delete() method should delete a field if a string is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                mapper.delete("id");
                assert.equal(this.srcObj.id, undefined);
            });

            it("The delete() method should delete a field if a array of string is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                mapper.delete(["id","firstName"]);
                assert.equal(this.srcObj.id, undefined);
                assert.equal(this.srcObj.firstName, undefined);
            });
        });

    });

    describe("Feature: Renaming", () => {
        
        beforeEach(()=>{
            this.srcObj = {id:1, firstName:"supun"};
            this.mapper = new SteroidsMapper(this.srcObj);
        });

        describe("Scenario: Developer passes a non object for the map function", () => {          

            it("The map() method should throw an exception for an undefined value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map(undefined);
                },SteroidMapperException);
            });

            it("The map() method should throw an exception for a numeric value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map(123);
                },SteroidMapperException);
            });

            it("The map() method should throw an exception for a boolean value", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map(true);
                },SteroidMapperException);
            });

            it("The map() method should throw an exception for a array of numeric values", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                assert.throws(() => {
                    let mapObj = mapper.map([1,2,3,4,5]);
                },SteroidMapperException);
            });

        });

        describe("Scenario: Developer passes a string, or an array of strings for the map function", () => {          

            it("The map() method should return a controller object when a string is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                let controllerObject = mapper.map("id");

                assert.equal(controllerObject instanceof MapOps, true);
            });

            it("The map() method should return a controller object when a string array is passed", () => { 
                let mapper:SteroidsMapper = this.mapper;
               
                let controllerObject = mapper.map(["id","name"]);

                assert.equal(controllerObject instanceof MapOps, true);
            });


            it("When a function is passed to the to() function the value of the field should be modified", () => { 
                let mapper:SteroidsMapper = this.mapper;

                mapper.map("id").to((value)=> value + 1);

                assert.equal(this.srcObj.id, 2);
            });

            it("When an undefined value is passed to the to() function should throw an exception", () => { 
                let mapper:SteroidsMapper = this.mapper;              

                assert.throws(() => {
                    mapper.map("id").to(undefined);
                },SteroidMapperException);
            });
        });

    });
});