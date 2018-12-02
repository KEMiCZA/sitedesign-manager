import { FETCH_SITEDESIGNSANDSCRIPTS, UPDATE_SITEDESIGN, APP_LOADING, CREATED_SITEDESIGN, DELETED_SITEDESIGN } from '../actions/types';

const initialState = {
    sitedesigns: [],
    sitescripts: [],
    selectedSiteDesign: null,
    loading: true,
    siteDesignsUpdatedVersion: 0,
    siteScriptsUpdatedVersion: 0,
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
        case UPDATE_SITEDESIGN:
            let updatedSiteDesigns = [...state.sitedesigns];
            let indexSD = updatedSiteDesigns.map(x => x.Id).indexOf(action.payload.updatedSiteDesign.Id);
            // Detect if we have a new default SD or detect if we have switched from an already default template from ie team site to communication site 
            if ((updatedSiteDesigns[indexSD].IsDefault !== action.payload.updatedSiteDesign.IsDefault) || (updatedSiteDesigns[indexSD].IsDefault && updatedSiteDesigns[indexSD].WebTemplate !== action.payload.updatedSiteDesign.WebTemplate)) {
                let otherDefaultSD = updatedSiteDesigns.filter(x => x.IsDefault && x.WebTemplate == action.payload.updatedSiteDesign.WebTemplate);
                if (otherDefaultSD.length > 0) {
                    let indexOfOtherDefaultSD = updatedSiteDesigns.map(x => x.Id).indexOf(otherDefaultSD[0].Id);
                    updatedSiteDesigns[indexOfOtherDefaultSD] = { ...updatedSiteDesigns[indexOfOtherDefaultSD], IsDefault: false };
                }
            }

            updatedSiteDesigns[indexSD] = action.payload.updatedSiteDesign;
            let newSiteDesignsUpdatedVersion = state.siteDesignsUpdatedVersion + 1;
            updatedSiteDesigns.sort((x, y) => (x.IsDefault === y.IsDefault) ? 0 : x.IsDefault ? -1 : 1);
            return {
                ...state,
                sitedesigns: updatedSiteDesigns,
                siteDesignsUpdatedVersion: newSiteDesignsUpdatedVersion,
            };
        case CREATED_SITEDESIGN:
            let newSiteDesigns = [...state.sitedesigns, action.payload.newSiteDesign];
            newSiteDesigns.sort((x, y) => (x.IsDefault === y.IsDefault) ? 0 : x.IsDefault ? -1 : 1);
            return {
                ...state,
                sitedesigns: newSiteDesigns,
            };
        case DELETED_SITEDESIGN:
            return {
                ...state,
                sitedesigns: state.sitedesigns.filter(x => x.Id !== action.payload.deletedSiteDesignId),
            };
        default:
            return state;
    }
};