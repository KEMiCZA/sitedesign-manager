import * as React from 'react';
import SitedesignsViewer from './sitedesigns/SitedesignsViewer';
import SitescriptsViewer from './sitescripts/SitescriptsViewer';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { connect } from 'react-redux';
import { loadInitialSiteDesignAndScripts } from '../actions/sitedesigns-manager-actions';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import SiteDesignEditor from './sitedesigns/SiteDesignEditor';

export class SiteDesignsManager extends React.Component<any, {}> {
  constructor(props) {
    super(props);
    this._reloadAll = this._reloadAll.bind(this);
    this._onRenderItem = this._onRenderItem.bind(this);
  }

  public componentWillMount() {
    this.props.loadInitialSiteDesignAndScripts();
  }

  public render(): React.ReactElement<{}> {
    return (
      <div>
        <OverflowSet
          items={[
            {
              key: 'newItem',
              name: 'New',
              icon: 'Add',
              ariaLabel: 'New. Use left and right arrow keys to navigate',
              onClick: () => {
                return;
              },
              subMenuProps: {
                items: [
                  {
                    key: 'siteDesign',
                    name: 'Site Design',
                    icon: 'Design'
                  },
                  {
                    key: 'siteScript',
                    name: 'Site Script',
                    icon: 'Script'
                  }
                ]
              }
            },
            {
              key: 'refreshAll',
              name: 'Refresh',
              icon: 'Refresh',
              ariaLabel: 'Refresh all site designs and site actions',
              onClick: () => {
                return;
              },
            },
          ]}
          onRenderOverflowButton={this._onRenderOverflowButton}
          onRenderItem={this._onRenderItem}
        />
        <Pivot key="pivot1KEY">
          <PivotItem
            headerText="Site Designs"
            headerButtonProps={{
              'data-order': 1,
              'data-title': 'Site Designs'
            }}
          >
            {this.props.loading ? <Spinner size={SpinnerSize.large} label="Loading site designs..." ariaLive="assertive" /> : <SitedesignsViewer />}
          </PivotItem>
          <PivotItem
            headerText="Site Scripts"
            headerButtonProps={{
              'data-order': 2,
              'data-title': 'Site Scripts'
            }}>
            {this.props.loading ? <Spinner size={SpinnerSize.large} label="Loading site scripts..." ariaLive="assertive" /> : <SitescriptsViewer />}
          </PivotItem>
        </Pivot>

        <Dialog
          hidden={!this.props.siteDesignEditorVisible}
          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Site Design Editor',
          }}
          modalProps={{
            titleAriaId: 'myLabelId',
            subtitleAriaId: 'mySubTextId',
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          <SiteDesignEditor />
        </Dialog>

      </div >
    );
  }

  private _closeDialog = (): void => {
  }

  private _reloadAll = (): void => {
    this.props.loadInitialSiteDesignAndScripts();
  }

  private _onRenderItem(item: IOverflowSetItemProps): JSX.Element {
    if (item.onRender) {
      return item.onRender(item);
    }
    return <DefaultButton iconProps={{ iconName: item.icon }} menuProps={item.subMenuProps} text={item.name} onClick={this._reloadAll} />;
  }

  private _onRenderOverflowButton(overflowItems: any[] | undefined): JSX.Element {
    return (
      <DefaultButton menuIconProps={{ iconName: 'More' }} menuProps={{ items: overflowItems! }} />
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    loading: state.loading,
    siteDesignEditorVisible: state.selectedSiteDesign != null
  };
};

export default connect(mapStateToProps, { loadInitialSiteDesignAndScripts })(SiteDesignsManager);