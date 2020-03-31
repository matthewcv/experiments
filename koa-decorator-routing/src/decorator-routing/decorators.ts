
import * as Router from 'koa-router'
import 'reflect-metadata'
import Application = require('koa');



export enum HttpVerb {
    get = "GET",
    post = "POST",
    put = "PUT",
    delete = "DELETE"
}

enum ActionParameterSource {
    route = "ROUTE",
    query = "QUERY",
    body = "BODY"
}

interface ViewModelPropDescriptor {
    name: string,
    type: Function
}

class TypeParseError extends Error {
    constructor(message) {
        super(message)
    }
}

class ActionParameterDescriptor {
    index: number;
    name: string;
    type: Function; // this is going to be the constructor function of the type. Number, String, Object, Date, etc...
    actionName: string;
    controller: Function;
    actionDescriptor: ActionDescriptor;
    source: ActionParameterSource = ActionParameterSource.route;

    getParamValue(value) {
        return convertType(value, this.type)
    }
}

class ActionDescriptor {
    methodName: string;
    routeSegment?: string;
    verb: HttpVerb;
    controller: Function;
    controllerDescriptor: ControllerDescriptor;
    parameters: ActionParameterDescriptor[] = [];

    findParameters(argNames: string[], argTypes: Function[]) {

        var params = actionParameterDescriptors.filter(apd => apd.actionName === this.methodName && apd.controller === this.controller);
        params.forEach(p => {
            this.parameters.unshift(p);
            p.name = argNames[p.index];
            p.type = argTypes[p.index];
            p.actionDescriptor = this;
        })
    }

}

class ControllerDescriptor {

    controller: Function;
    actions: ActionDescriptor[] = [];

    findActions() {
        var actions = actionDescriptors.filter(ad => ad.controller === this.controller).reverse();
        actions.forEach(a => {
            this.actions.unshift(a);

            a.controllerDescriptor = this;
        })
    }

}

const actionParameterDescriptors: ActionParameterDescriptor[] = [];
const actionDescriptors: ActionDescriptor[] = [];
const controllerDescriptors: ControllerDescriptor[] = [];


export function GetDecoratorRoutes():Router.IMiddleware {
    const router = new Router();

    controllerDescriptors.forEach(cd => {
        cd.actions.forEach(ad => {
            var route = getRoute(cd,ad);
            console.log('add route', ad.verb, route)
            router.register(route,[ad.verb], async (ctx, next)=>{

                await executeAction(ad,ctx, next);
            })
        })

    })
       

    return router.routes();

}


async function executeAction(actionDescriptor: ActionDescriptor, context: Application.Context, next:Application.Next) {

    
    var params = [];
    try
    {
        if(actionDescriptor.parameters.length){
            
            actionDescriptor.parameters.forEach(adp => {
                var val;
                if(adp.source === ActionParameterSource.route) {
                    val = context.params[adp.name]
                } else if(adp.source === ActionParameterSource.body) {
                    val = context.request.body;
                }
                
                params[adp.index] = adp.getParamValue( val );
            })
        }
    } catch( e) {
        if(e instanceof TypeParseError) {
            context.throw(400, e.message)
        } else {
            throw e;
        }

    }

    

    var controller = Reflect.construct(actionDescriptor.controller, []);

    var response = controller[actionDescriptor.methodName](...params);

    context.body = response;

}

function createActionParameterDescriptor(source:ActionParameterSource, controllerPrototype, actionMethodName, parameterPosition) {
    var apd = new ActionParameterDescriptor();
    apd.actionName = actionMethodName;
    apd.index = parameterPosition;
    apd.controller = controllerPrototype.constructor;
    apd.source = source;


    
    actionParameterDescriptors.push(apd);
}


/// goes on action method arguments to describe route parameters. 
export function Param(controllerPrototype, actionMethodName, parameterPosition){
    //console.log("Param", controllerPrototype.constructor.name, actionMethodName, parameterPosition)

    createActionParameterDescriptor(ActionParameterSource.route, controllerPrototype, actionMethodName, parameterPosition)
}

/// goes on an action method argument to inicate that the argument should be populated from the request body. 
/// Should only have one per action method and should be the last argument defined on the actino method
export function FromBody(controllerPrototype, actionMethodName, parameterPosition) {
    createActionParameterDescriptor(ActionParameterSource.body, controllerPrototype, actionMethodName, parameterPosition)
}

const ViewModelPropsMetadataKey = "viewmodel:classprops"

export function ViewModel(target, propertyKey?) {
    //var meta = Reflect.getMetadataKeys(target,propertyKey)

    if(typeof(target) === "function") {
        // the class is decorated, target is the class' constructor
        let classProps = Reflect.getMetadata(ViewModelPropsMetadataKey,target.prototype);
        // console.log('viewmodel constructor prototype classprops', classProps)
    }
    if(typeof(target) === "object") {
        // a property is decorated, target is the class' prototype. 
        // this decorator will get called for all properties before it gets called for the constructor. 
        // add metadata to a prototype about all its properties. 
        let classProps: ViewModelPropDescriptor[] = Reflect.getMetadata(ViewModelPropsMetadataKey,target);
        if(!classProps) {
            classProps = [];
            Reflect.defineMetadata(ViewModelPropsMetadataKey,classProps, target)
        }
        classProps.push({
            name: propertyKey,
            type: Reflect.getMetadata('design:type', target,propertyKey)
        })
        
    }

    //console.log("ViewModel", target, typeof(target), target.constructor.name, propertyKey, Reflect.getMetadata('design:type', target,propertyKey), meta )
}

export function Get(routeSegment?: string) {
    return Action(HttpVerb.get, routeSegment);
}

export function Post(routeSegment?: string) {
    return Action(HttpVerb.post, routeSegment);
}

export function Action(method: HttpVerb, routeSegment?: string) {

    return (controllerProto, actionMethodName, descriptor) => {

        var paramtypes = Reflect.getMetadata("design:paramtypes",controllerProto,actionMethodName);

        //console.log('Action', controllerProto.constructor.name, actionMethodName, descriptor.value.toString())

        var ad = new ActionDescriptor();
        ad.methodName = actionMethodName;
        ad.routeSegment = routeSegment;
        ad.controller = controllerProto.constructor;
        ad.verb = method;
        ad.findParameters(getArgumentNames(descriptor.value.toString()), paramtypes)
        // console.log(ad);
        actionDescriptors.push(ad);
    }
    
}

export function Controller(controllerClass: Function) {

    var cd = new ControllerDescriptor();
    cd.controller = controllerClass;
    cd.findActions();
    //console.log(cd);
    controllerDescriptors.push(cd);



}

function getArgumentNames(funcStr: string){
    var lidx = funcStr.indexOf('(');
    var ridx = funcStr.indexOf(')', lidx);

    return funcStr.substring(lidx + 1, ridx).split(',').map(s => s.trim())
}


function getRoute(controllerDescriptor: ControllerDescriptor, actionDescriptor: ActionDescriptor):string {

    var name = controllerDescriptor.controller.name;

    var route = "/" + name.replace(/controller/i,'');

    //if the action method is the same name as the http verb, then this is a 'default route' and no need to use the method name as part of the route. 
    var segment = actionDescriptor.routeSegment;
    if(segment === null || segment === undefined){
        segment = actionDescriptor.methodName;
    }
    if(segment.toUpperCase() === actionDescriptor.verb) {
        segment = ''
    }
    if(segment.length)
    {
        route += "/" + segment;
    }


    

    if(actionDescriptor.parameters.length){
        actionDescriptor.parameters.forEach(adp => {
            if(adp.source === ActionParameterSource.route)
            route += "/:" + adp.name 
        })
    }

    return route;
}


/// value is usually a string or @ViewModel instance. May want to do more later if value is a different type. numbers can go into dates for example
function convertType(value: any, toType:Function): any {

    if(!toType || toType == String || toType == Object) {
        return value;
    }
    if(toType == Boolean) { 
        // need a better more i18n way of doing this. 
        return !/no|false|0/i.test(value)
    }
    

    // Date and Number parse into NaN if they can't parse into their actual types.
    var convertedValue;
    if(toType == Date){
        if(typeof(value) == "string"){
            convertedValue = new Date(Date.parse(value));
        } else if(typeof(value) === "number"){
            convertedValue = new Date(value)
        }
    } else if(toType == Number) {
        convertedValue = Number(value)
    } 
    
    if(convertedValue !== undefined && isNaN(convertedValue)) {
        throw new TypeParseError(`could not parse '${value}' into type ${toType.name}`);
    }

    if(convertedValue === undefined) {
        /// the type is a custom constructor. Check to see if it's class decorated with @ViewModel. create an instance, copy the properties over.

        if(Reflect.hasMetadata(ViewModelPropsMetadataKey,toType.prototype)) {
            const props:ViewModelPropDescriptor[] = Reflect.getMetadata(ViewModelPropsMetadataKey,toType.prototype);

            convertedValue = Reflect.construct(toType,[])
            
            for (const prop of props) {
                if(Reflect.has(value,prop.name)){
                    convertedValue[prop.name] = convertType(Reflect.get(value, prop.name), prop.type)
                }
            }

            
            //console.log(...props)

        }


    }


    return convertedValue;


}