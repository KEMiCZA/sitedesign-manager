import { FETCH_SITEDESIGNSANDSCRIPTS, EDIT_SITEDESIGN, APP_LOADING } from './types';
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

export const editSiteDesign = (siteDesign) => async dispatch => {
    let siteDesignMetadata = await sp.siteDesigns.getSiteDesignMetadata(siteDesign.Id);

    dispatch({
        type: EDIT_SITEDESIGN,
        payload: {
            selectedSiteDesign: siteDesignMetadata
        }
    });
};

export const deleteSiteDesign = (siteDesignId) => async dispatch => {
    dispatch({
        type: APP_LOADING,
        payload: {
            loading: true
        }
    });

    await sp.siteDesigns.deleteSiteDesign(siteDesignId);
    
};

export const saveSiteDesign = (siteDesignUpdateInfo) => async dispatch => {

    dispatch({
        type: APP_LOADING,
        payload: {
            loading: true
        }
    });

    siteDesignUpdateInfo["odata.metadata"] = undefined;
    let result = await sp.siteDesigns.updateSiteDesign(siteDesignUpdateInfo);

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

