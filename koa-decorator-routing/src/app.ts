import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as Body from 'koa-body'
import {  GetDecoratorRoutes } from './decorator-routing/decorators';

// need to import the file so that the decorators execute
import './controllers/default-controller'

const app = new Koa();
const router = new Router();
const router2 = new Router();
console.log('add logging middleware')

app.use( async (ctx, next) => {
    console.log(ctx.URL.toString())
    await next();
})

console.log('configure routes')
router.get('/', async (ctx,next) => {
    console.log('in / rout')
    ctx.body = "hello from router"
    
})

router2.get('/two', async (ctx,next) => {
    console.log('in / rout')
    ctx.body = "hello from router two"
    
})


app.use(Body());
app.use(router.routes());
app.use(router2.routes());
app.use(GetDecoratorRoutes());
console.log('start app')
app.listen(8080);



