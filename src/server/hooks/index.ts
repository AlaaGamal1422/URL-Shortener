import contextHooks from './context';
import globalHooks from './global';
import {hook} from './../../types/server'
const hooks: hook[] = [];
// Context hooks
contextHooks.forEach((entry) => {
    hooks.push({
        type: 'context',
        hook: entry,
    });
});
// Global hooks
globalHooks.forEach((entry) => {
    hooks.push({
        type: 'global',
        hook: entry,
    });
});

export default hooks;
