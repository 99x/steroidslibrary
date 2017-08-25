# Steroids Framework

Steroids framework simplifies the development of microservices using TypeScript by enabling the developer to emphasize more on business / domain logic rather than focusing too much on technical details. 
## Problems Steroids Aims to Solve;
### Write microservices using a synchronous programming model: 
JavaScript uses an asynchronous programming model which could reduce the maintainability and readability of the code. Steroids framework enables the developers to use a synchronous programming model while utilizing the non-blocking IO feature of Node.JS. Therefore code writing using Steroids framework is more readable, and maintainable.

### Easily respond to requirement changes:
The programming model of the Steroids framework is designed keeping agility in mind therefore it can easily respond requirement changes. 

### Use C# style dependency injection :
Steroids consists of a dependency injection container known as 'Flask' which will enable the developer to use dependency injection similar to how its done in C#.

### Write testable microservices:
Steroids includes a TypeScript testing framework which is written on top of Mocha test runner which uses a same synchronous programming model. Therefore writing unit test and BDD style of tests are simplified using the framework.

### Host microservices in different platforms:
Microservices written using steroids can be ported across different platforms such as AWS lambda, or Dockers without any code change. Steroids framework can be integrated with a CI tool such as Bitbucket pipelines which configures the framework to run in any platform. 

### Extend the framework with new database / caching technologies
When the data volume of a particular microservice increases to a bigger scale it would be necessary to move to a more scalable database. Steroids framework consists of a plug-in based design which makes it capable of integrating with a new database or caching technology. 




# Conceptual Architecture

A technology-free architecture of Steroids framework which shows the high level components is as follows;

## Service Container:
Service container refers to the environment where the business logic (Steroids Services) is hosted. The purpose of the Service Container is to expose the steroids services as REST endpoints which can be consumed by 3rd party applications. The container could be either AWS Lambda or Stereoids Runtime which can be used to host Steroids service either in a Docker or in a cloud instance such as a EC2. 

## Steroids Services:
Steroids Services consists of the business logic of the microservices which are written in TypeScript.

## Steroids Library:
Steroids library enables the developer to write services in a synchronous declarative type of programming model while utilizing the non-blocking IO feature of Node.JS. Currently it has extensible components related to caching, and data storage which can be extended using custom made plugins. For example when a new database is required to be integrated with steroids, the framework can be extended by writing a plugin for the particular database. In addition to its extensible components, the library consists of features that makes it easier to transform JSON documents, log activities and errors.

# Steroids Programming Model
Steroids programming model follows a synchronous programming model in TypeScript. It makes use of JavaScript coding patterns such as method chaining, and ES6 'async' and 'await' keywords to avoid asynchronous style of a programming model. Therefore Services written using Steroids Framework avoids the callback hell anti pattern. In addition the code becomes more readable, maintainable and compact.

![alt text](https://raw.githubusercontent.com/99xt/steroidslibrary/master/doc/image_architecture.png)


## Programming Model

```typescript
import {AbstractService} from "steroidslibrary/AbstractService"
import {Steroid} from "steroidslibrary/Steroids"
 
 
export class SampleSteroidService extends AbstractService {
     
    protected onHandle(steroid: Steroid) {
        let output = {message:"hello from steroids"};
        return output;
    }
 
}
```

A Steroids Service should inherit the abstract class AbstactService and implement the method onHandle. The business logic can be written in the 'onHandle' method. The response of the REST endpoint can be returned in the onHandle method. This method is invoked by the Steroids Framework using a parameter of a type 'Steroid'.

A 'Steroid' object passed for this method consists of reusable features that are commonly used by a microservice developer such as Relational Database access, Caching, Object Transforming, Logging,etc... For example a query in a relational database can be executed using the 'Steroid' object. Mapping the resulting rows to JSON objects is automatically handled by the Steroids framework. No O-R mapping is required.


Calling a Database
```typescript
class Property //the class we need to map the query result
{
    public id:nubmber;
    public EDokNumber:string;
}

 
let query =  "SELECT * FROM Plot p WHERE p.EdokNumber = '123'"; //the query that is needed to be executed
let properties:Property = await steroid.database().relational().executeQuery(Property,query); //execute the query using steroids
```

![alt text](https://raw.githubusercontent.com/99xt/steroidslibrary/master/doc/image_model.png)


The reusable components in steroids can be accessed using a method chain.
The first method represents the category of the resources that are available in steroids. For example the database() method returns the type of databases that can be used, the mapper() method returns features to transform a JSON object. Feature represents the actual function the developer needs to access, and the feature parameters represents the parameters that is required for that particular feature.


## Using ES7 async and await Keywords

Steroids avoid anti patterns such as callback hells and eliminates asynchronous style of coding using async and await keywords. Non-blocking method calls in steroids that require Javascript callbacks or promises, are replaced by 'async' and 'await' keywords.  An example of a non-blocking method call is a executing a query in a database. The following code shows an example of querying from a database.


ES7 async and await
```typescript
import {AbstractService} from "steroidslibrary/AbstractService"
import {Steroid} from "steroidslibrary/Steroids"
 
 
export class SampleSteroidService extends AbstractService {
     
    protected async onHandle(steroid: Steroid) { //if 'await' keyword is used inside the method, 'async' keyword should be used as a modifier.
 
        let query =  "SELECT * FROM Plot p WHERE p.EdokNumber = '123'";
 
        let properties:Property = await steroid.database().relational().executeQuery(Property,query); //non-blocking calls such as database access should have the await keyword
 
        return properties;
    }
 
}
```



# Licencing

Steroids is released under MIT license
