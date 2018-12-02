import { createStore as reduxCreateStore, applyMiddleware, Store } from "redux";
import thunk from "redux-thunk";
import myRootReducer from '../reducers';

export function createStore(): Store<any> {
    const initialState: any = {
        sitedesigns: [],
        sitescripts: [],
        selectedSiteDesign: null,
        loading: true,
        siteDesignsUpdatedVersion: 0, // increment this after updating a SD so we know we can refresh our component
        siteScriptsUpdatedVersion: 0, // increment this after updating a SS so we know we can refresh our component
    };

    const middleWare = [thunk];
    return reduxCreateStore(myRootReducer(), initialState, applyMiddleware(...middleWare));
}


