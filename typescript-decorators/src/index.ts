/// <reference path="../node_modules/reflect-metadata/standalone.d.ts" />


function ClassDecorator(target, name?, descriptor?) {
  console.info("ClassDecorator", target, name, descriptor);
}

function CtorDecorator(target, name, descriptor?) {
  console.info("CtorDecorator", target, name, descriptor);
}

function FieldDecorator(target, name, descriptor?: TypedPropertyDescriptor<any>) {
    // typeof(target) will be 'function' if the field is static because the constructor is passed
    // typeof(target) will be 'object' if the field is instance because the prototype is passed
  console.info("FieldDecorator", target, name, descriptor,typeof(descriptor));
}

function FancyDecorator(param:string) {

  return (target, name, descriptor?) => {

    console.info("FancyDecorator", param, target, name, descriptor)
  }
}


function ParamDecorator(target, name, descriptor?) {
  console.info("ParamDecorator", target, name, descriptor);
}

function MethodDecorator(target, name, descriptor?: TypedPropertyDescriptor<any>) {
  var paramMetadata = Reflect.getMetadata("design:paramtypes", target,name)
  console.info("MethodDecorator", target, name, descriptor, typeof(descriptor));
}


class SomeBaseClass {
  baseField = "bassy"
}

//@ClassDecorator
export class DecoratedClass extends SomeBaseClass {

  @FancyDecorator("this is a static field")
  static staticField = "shit";

  @FancyDecorator("the field called name")
  name: string = "matthew";

  //@FancyDecorator("the field called age")
  //@FieldDecorator
  set age(val: number) {}
  get age() {
    return 3;
  }

  constructor(
    //@CtorDecorator public something: string,
    //@CtorDecorator somethingelse: number
  ) {
    super()
    console.info("DecoratedClass constructor", arguments);
  }

  //@MethodDecorator
  DoSomething( param1: DecoratedClass) {}
}

//var c = new DecoratedClass('hi');


