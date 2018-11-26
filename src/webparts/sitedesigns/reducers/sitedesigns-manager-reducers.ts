import { FETCH_SITEDESIGNSANDSCRIPTS, EDIT_SITEDESIGN, APP_LOADING } from '../actions/types';

const initialState = {
    sitedesigns: [],
    sitescripts: [],
    selectedSiteDesign: null,
    loading: true
};

export default (state = initialState, action: any) => {
    switch (action.type) {
        case APP_LOADING:
            return {
                ...state,
                loading: action.payload.loading
            };
        case FETCH_SITEDESIGNSANDSCRIPTS:
            return {
                ...state,
                sitedesigns: action.payload.sitedesigns,
                sitescripts: action.payload.sitescripts,
                selectedSiteDesign: null,
                loading: false
            };
        case EDIT_SITEDESIGN:
            return {
                ...state,
                selectedSiteDesign: action.payload.selectedSiteDesign,
                loading: false
            };
        default:
            return state;
    }
};