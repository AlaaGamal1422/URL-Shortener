import dotenv from 'dotenv';
import dns from 'dns';
import hooks from './src/server/hooks';
import middlewares from './src/server/middlewares';
import Server from './src/server';
import { tragetedConfigurations } from './src/config';

const api = tragetedConfigurations.api
dns.setServers(['1.1.1.1', '8.8.8.8']); // forcing edit the dns

dotenv.config({ path: './config.env' });

const instance = new Server({
    name: api.name,
    port: api.port as string,
    hooks,
    middlewares,
    onStart: async () => {

    },
    onEnd: async () => {

    }
});


instance.start();
