import { combineReducers, Reducer } from 'redux';
import siteDesingManagerReducer from './sitedesigns-manager-reducers';

export default function rootReducer(): Reducer {
    return siteDesingManagerReducer;
    // return combineReducers({
    //     app: siteDesingManagerReducer
    // });
}