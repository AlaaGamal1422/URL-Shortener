const jwt = require('jsonwebtoken');
const { authentication: { local} } = require('../config');
const { UnauthorizedError } = require('./errors');

class Crypto {
    static async createJwtToken(data) {
        return new Promise((resolve, reject) => {
            jwt.sign(data, local.key, (err, token) => {
                if (err) {
                    return reject(err);
                }
                return resolve(token);
            });
        });
    }

    static async createJwtTokenWithExpiration(signObj, timeoutMs = 0) {
        return new Promise((resolve, reject) => {
            const cSignObject = { ...signObj };
            const currentTime = new Date(Date.now()).getTime() / 1000;
            const expireAfter = timeoutMs / 1000;
            cSignObject.exp = currentTime + expireAfter;

            jwt.sign(cSignObject, local.key, (err, token) => {
                if (err) {
                    return reject(err);
                }

                return resolve(token);
            });
        });
    }

    static async verifyJwtToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, local.key, (err, decoded) => {
                if (!err) {
                    return resolve(decoded);
                }
                let errorCode;
                let errorMsg;
                if (err.name === 'TokenExpiredError') {
                    errorCode = 101;
                    errorMsg = 'Token has been expired';
                } else if (err.name === 'JsonWebTokenError') {
                    errorMsg = 'Invalid authorization token';
                }

                const error = new UnauthorizedError(errorMsg || err.message);
                error.code = errorCode || err.code;

                return reject(error);
            });
        });
    }
}

module.exports = Crypto;
