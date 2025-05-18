import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import koaQs from 'koa-qs';
import routes from './routes';
import cors from '@koa/cors';
import connectToMongo from './mongo';

const app = new Koa();
koaQs(app);  

app.use(cors({
    origin: 'http://localhost:9080',
}));
app.use(bodyParser());
app.use(routes.allowedMethods());
app.use(routes.routes());

const PORT = 3000;

async function startServer() {
    try {
        await connectToMongo();
        app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
    } catch (error) {
        console.error('Mongodb connection failed', error);
    }
}

startServer();
