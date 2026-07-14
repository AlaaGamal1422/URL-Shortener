import development from './config.dev';
import production from './config.prod';
type Environment = 'development' | 'production';
const env = process.env.NODE_ENV || 'development';

const configurations = {
    development,
    production,
};

const tragetedConfigurations = configurations[env as keyof typeof configurations]
const SERVICE = {
    TYPE : ''
}

export {
    tragetedConfigurations,
    SERVICE
} 
