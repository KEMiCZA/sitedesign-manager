import { FETCH_SITEDESIGNSANDSCRIPTS, UPDATE_SITEDESIGN, CREATED_SITEDESIGN, DELETED_SITEDESIGN, APP_LOADING } from './types';
import { sp } from '@pnp/sp';

export const loadInitialSiteDesignAndScripts = () => async dispatch => {
    dispatch({
        type: APP_LOADING,
        payload: {
            loading: true
        }
    });

    let siteDesigns = await sp.siteDesigns.getSiteDesigns();
    siteDesigns = siteDesigns.sort((x, y) => (x.IsDefault === y.IsDefault) ? 0 : x.IsDefault ? -1 : 1);
    let siteScripts = await sp.siteScripts.getSiteScripts();

    dispatch({
        type: FETCH_SITEDESIGNSANDSCRIPTS,
        payload: {
            sitedesigns: siteDesigns,
            sitescripts: siteScripts,
            selectedSiteDesign: null
        }
    });
};

export const siteDesignAdded = (sitedesign: any) => async dispatch => {
    dispatch({
        type: CREATED_SITEDESIGN,
        payload: {
            newSiteDesign: sitedesign,
        },
    });
};

export const siteDesignDeleted = (sitedesignId: any) => async dispatch => {
    dispatch({
        type: DELETED_SITEDESIGN,
        payload: {
            deletedSiteDesignId: sitedesignId,
        },
    });
};

export const siteDesignUpdated = (siteDesign) => async dispatch => {
    // let siteDesignMetadata = await sp.siteDesigns.getSiteDesignMetadata(siteDesign.Id);
    dispatch({
        type: UPDATE_SITEDESIGN,
        payload: {
            updatedSiteDesign: siteDesign
        }
    });
};
