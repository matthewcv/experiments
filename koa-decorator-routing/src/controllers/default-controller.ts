import { Controller, Action, Param, HttpVerb, Get, Post, FromBody,ViewModel } from "../decorator-routing/decorators"

class BaseController {

}

@ViewModel
// marks the class as a viewmodel. @ViewModel classes can be used as action method arguments. 
// An instance of the type will be created and populated and then sent to the action method argument
class ActionParameter {
    

    @ViewModel 
    // the @ViewModel decorator on a property specifies the property that will be populated from the parameter source. 
    // If the property is not decorated with @ViewModel then it will not be populated even if the source has the value.
    name: string ;

    @ViewModel
    birthday: Date ;

    @ViewModel
    isCool: boolean;
}



@Controller //all @Action methods in this class will have routes created with the pattern /Default/{action name}/{parameters if any}
class DefaultController extends BaseController{


    //Routes get registered in the order they are defined on the class



    // @Get('')
    // @Get('list')
    // getList(){
    //     return [
    //         {name:'matthew'},
    //         {name:'carol'}
    //     ]
    // }

    @Get('one')
    @Get() //a method with the same name as the http verb will be a default route for that action so the route here is GET /Default/:id
    get(@Param id) {
        return 'hello from controller action method "get" param:' + id;
    }
    // @Get('something') // Shortcut for @Action(HttpVerb.get)
    // doSomething(@Param id: string) {
    //     return "this is from a doSomething action method " + id;
    // }

    // @Action(HttpVerb.get)
    // doAnotherThing(@Param id: number, @Param name: string) {
    //     return `this is from a doAnotherThing action method. id: ${id}, name: ${name} `;
    // }


    // @Action(HttpVerb.get)
    // doJson(@Param id: number, @Param name: string) {
    //     return {
    //         id, name
    //     };
    // }

    
    // @Action(HttpVerb.get)
    // doSomethingDate(@Param when: Date) {
    //     return "this is from a doSomethingDate action method " + when;
    // }    

    // @Action(HttpVerb.get)
    // doSomethingBool(@Param yes: boolean) {
    //     return "this is from a doSomethingBool action method " + yes;
    // }

    // @Post() // shortcut for @Action(HttpVerb.post)
    // // can have different types of decorators for action method arguments. 
    // // @Param is a route parameter - /:id in the route.
    // // @FromBody will take the http-body entity and convert it to the specified type and provide it to that argument. @FromBody must be the last argument in the list
    // doSomethingWithClass(@Param id: number, @FromBody param: ActionParameter) {
        
    //     return {
    //         "action":"doSomethingWithClass",
    //         "param": param || null,
    //         "id": id

    //     }
    // }
}

