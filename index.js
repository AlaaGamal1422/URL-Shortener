const hooks = require('./src/server/hooks');
const middlewares = require('./src/server/middlewares');
const Server = require('./src/server');

const { api } = require('./src/config');

const instance = new Server({
    name: api.name,
    port: api.port,
    hooks,
    middlewares,
    onStart: async () => {

    },
    onEnd: async () => {

    }
});

instance.start();
