var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import '../node_modules/reflect-metadata/Reflect.js';
function ClassDecorator(target, name, descriptor) {
    console.info("ClassDecorator", target, name, descriptor);
}
function CtorDecorator(target, name, descriptor) {
    console.info("CtorDecorator", target, name, descriptor);
}
function FieldDecorator(target, name, descriptor) {
    // typeof(target) will be 'function' if the field is static because the constructor is passed
    // typeof(target) will be 'object' if the field is instance because the prototype is passed
    console.info("FieldDecorator", target, name, descriptor, typeof (descriptor));
}
function FancyDecorator(param) {
    return (target, name, descriptor) => {
        console.info("FancyDecorator", param, target, name, descriptor);
    };
}
function ParamDecorator(target, name, descriptor) {
    console.info("ParamDecorator", target, name, descriptor);
}
function MethodDecorator(target, name, descriptor) {
    var paramMetadata = Reflect.getMetadata("design:paramtypes", target, name);
    console.info("MethodDecorator", target, name, descriptor, typeof (descriptor));
}
class SomeBaseClass {
    constructor() {
        this.baseField = "bassy";
    }
}
//@ClassDecorator
export class DecoratedClass extends SomeBaseClass {
    constructor(
    //@CtorDecorator public something: string,
    //@CtorDecorator somethingelse: number
    ) {
        super();
        this.name = "matthew";
        console.info("DecoratedClass constructor", arguments);
    }
    //@FancyDecorator("the field called age")
    //@FieldDecorator
    set age(val) { }
    get age() {
        return 3;
    }
    //@MethodDecorator
    DoSomething(param1) { }
}
DecoratedClass.staticField = "shit";
__decorate([
    FancyDecorator("the field called name"),
    __metadata("design:type", String)
], DecoratedClass.prototype, "name", void 0);
__decorate([
    FancyDecorator("this is a static field"),
    __metadata("design:type", Object)
], DecoratedClass, "staticField", void 0);
//var c = new DecoratedClass('hi');
//can't put decorators on plain functions. TS compiler strips it from the output
export function SomeOldFunction(param) {
    return `${param}~~${param}`;
}
