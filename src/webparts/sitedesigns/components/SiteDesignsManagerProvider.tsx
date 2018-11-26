import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from '../store/sitedesign-manager-store';
import SiteDesignsManager from './SiteDesignsManager';

export default class SiteDesignsManagerProvider extends React.Component<{}, {}> {
  public render(): React.ReactElement<{}> {
    return (
      <Provider store={createStore()}>
        <SiteDesignsManager></SiteDesignsManager>
      </Provider>
    );
  }
}
