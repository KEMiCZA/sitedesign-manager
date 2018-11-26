import { createStore as reduxCreateStore, applyMiddleware, Store } from "redux";
import thunk from "redux-thunk";
import myRootReducer from '../reducers';

export function createStore(): Store<any> {
    const initialState: any = {
        sitedesigns: [],
        sitescripts: [],
        selectedSiteDesign: null,
        loading: true
    };

    const middleWare = [thunk];
    return reduxCreateStore(myRootReducer(), initialState, applyMiddleware(...middleWare));
}


