import {createServer} from 'node:http';
import handler from './api-handler.mjs';
createServer(handler).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('COMPASS listening on localhost'));
