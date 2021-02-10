const API_NAME = 'API_NAME';

module.exports = {
    api: {
        name: API_NAME,
        version: '1.0',
        host: 'localhost',
        port: process.env.PORT || 8080
    },
    common: {
        pageSize: 10,
        maxPageSize: 100
    },
    locales: {
        dataPath: `${__dirname}/locales`,
        dataExtension: '.json',
        supportedLocales: ['en', 'ar', '_']
    },
    authentication: {
        local: {
            issuer: 'roadrunner-delivery.com',
            key: '7f7217a1cc38ae5bb7c22198d2685abb',
        },
    }
};
