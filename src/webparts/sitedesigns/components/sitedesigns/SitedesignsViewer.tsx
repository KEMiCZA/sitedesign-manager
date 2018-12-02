import * as React from 'react';

import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { List } from 'office-ui-fabric-react/lib/List';
import './List.Basic.SiteDesignViewer.css';
import { connect } from 'react-redux';
import { Selection, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { loadInitialSiteDesignAndScripts, siteDesignDeleted } from '../../actions/sitedesigns-manager-actions';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { SiteDesignForm } from './SiteDesignForm';
import { FormTypeEnum } from '../enums/FormTypeEnum';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { DirectionalHint } from 'office-ui-fabric-react/lib/common/DirectionalHint';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { sp } from '@pnp/sp';

export interface ISiteDesignViewerProps {
  items?: any[];
  scripts?: any[];
  siteDesignsUpdatedVersion?: number;
}

export interface ISiteDesignMapActionsToProps {
  loadInitialSiteDesignAndScripts?: typeof loadInitialSiteDesignAndScripts;
  siteDesignDeleted?: typeof siteDesignDeleted;
}

export interface ISiteDesignViewerState {
  filterText?: string;
  items?: any[];
  originalItems?: any[];
  hideDeleteSDDialog: boolean;
  siteDesignToDelete: any;
  selectedDesigns: any[];
  siteDesignToEdit: any;
  siteDesignsUpdatedVersion: number;
}

const mapStateToProps = (state: any): any => {
  return {
    items: state.sitedesigns,
    scripts: state.sitescripts,
    siteDesignsUpdatedVersion: state.siteDesignsUpdatedVersion,
  };
};

@connect(mapStateToProps, { loadInitialSiteDesignAndScripts, siteDesignDeleted })
export default class SitedesignsViewer extends React.Component<ISiteDesignViewerProps & ISiteDesignMapActionsToProps, ISiteDesignViewerState> {
  private _selection: Selection;

  constructor(props: ISiteDesignViewerProps) {
    super(props);
    this.state = {
      filterText: '',
      items: props.items,
      hideDeleteSDDialog: true,
      siteDesignToDelete: null,
      selectedDesigns: [],
      originalItems: [...props.items],
      siteDesignToEdit: null,
      siteDesignsUpdatedVersion: props.siteDesignsUpdatedVersion,
    };

    this._onFilterChanged = this._onFilterChanged.bind(this);
    this._onEditSiteDesign = this._onEditSiteDesign.bind(this);
    this._onDeleteSiteDesign = this._onDeleteSiteDesign.bind(this);
    this._closeDialog = this._closeDialog.bind(this);
    this._onConfirmDeleteDesign = this._onConfirmDeleteDesign.bind(this);
    this._onSelectedSiteDesign = this._onSelectedSiteDesign.bind(this);
    this._selection = new Selection();
  }

  private static getDerivedStateFromProps(props: ISiteDesignViewerProps, state: ISiteDesignViewerState): ISiteDesignViewerState {
    // a sd was added or deleted
    if (props.items.length !== state.items.length) {

      return {
        ...state,
        items: props.items,
        originalItems: props.items
      };
    }

    // if an update happened
    if (props.siteDesignsUpdatedVersion !== state.siteDesignsUpdatedVersion) {
      return {
        ...state,
        items: props.items,
        originalItems: props.items,
        siteDesignsUpdatedVersion: props.siteDesignsUpdatedVersion
      };
    }

    // Return null to indicate no change to state.
    return null;
  }

  public render(): JSX.Element {
    const _columns: IColumn[] = [
      {
        key: 'column1',
        name: 'Title',
        fieldName: 'Title',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        data: 'string',
        isPadded: true
      },
      {
        key: 'column2',
        name: 'WebTemplate',
        fieldName: 'WebTemplate',
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        data: 'number',
        onRender: (item) => {
          return <span>{item.WebTemplate}</span>;
        },
        isPadded: true
      },
      {
        key: 'column3',
        name: 'Version',
        fieldName: 'Version',
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        isPadded: true
      },
      {
        key: 'column4',
        name: 'Id',
        fieldName: 'Id',
        minWidth: 70,
        maxWidth: 90,
        isResizable: true,
        isCollapsable: true,
        data: 'string'
      }
    ];

    const { items: originalItems } = this.state;
    const items = this.state.filterText ? this.state.items : this.state.originalItems;
    const resultCountText = items.length === originalItems.length ? '' : ` (${items.length} of ${originalItems.length} shown)`;
    const totalSelectedSiteDesigns = this.state.items.filter(x => x.selected).length;
    const editForm = this.state.siteDesignToEdit == null ? (<div></div>) : (<SiteDesignForm doneCallback={() => { this.setState({ ...this.state, siteDesignToEdit: null }); }} formType={FormTypeEnum.Edit} sd={this.state.siteDesignToEdit} />);

    return (
      <FocusZone direction={FocusZoneDirection.vertical} >
        {editForm}

        <h1>TOTAL SELECTED: {totalSelectedSiteDesigns}</h1>
        <TextField label={'Filter by title, id or description' + resultCountText} onBeforeChange={this._onFilterChanged} />
        <List items={items} onRenderCell={this._onRenderCell.bind(this)} />

        <Dialog
          hidden={this.state.hideDeleteSDDialog}
          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Delete Confirmation',
            subText: `Are you sure you want to delete sitedesign ${this.state.siteDesignToDelete != null && this.state.siteDesignToDelete.Title}?`
          }}
          modalProps={{
            isBlocking: false
          }}
        >
          {null /** You can also include null values as the result of conditionals */}
          <DialogFooter>
            <PrimaryButton onClick={this._onConfirmDeleteDesign} text="Yes" />
            <DefaultButton onClick={this._closeDialog} text="No" />
          </DialogFooter>
        </Dialog>
      </FocusZone>
    );
  }

  private _onFilterChanged(text: string): void {
    const { items } = this.props;

    this.setState({
      filterText: text,
      items: text ?
        items.filter(item => item.Title.toLowerCase().indexOf(text.toLowerCase()) >= 0
          || item.Id.toLowerCase().indexOf(text.toLowerCase()) >= 0
          || item.Description.toLowerCase().indexOf(text.toLowerCase()) >= 0)
        : items
    });
  }

  // Id, Title, WebTemplate, SiteScriptIds, Description, PreviewImageUrl, PreviewImageAltText, IsDefault, Version
  private _onRenderCell(item: any, index: number | undefined): JSX.Element {
    const siteScripts = item.SiteScriptIds.map(scId => {
      const scCalc = this.props.scripts.filter(sc => sc.Id == scId)[0];
      return (
        <a onClick={(a) => { alert(scCalc.Id); a.stopPropagation(); }}>{scCalc.Title}</a>
      );
    });
    const isSelected = item.selected === true ? { backgroundColor: "grey" } : {};

    return (
      <div className="ms-SiteDesignViewer-itemCell" data-is-focusable={true}>
        <div className="ms-SiteDesignViewer-itemContentSelection" style={isSelected}></div>
        <OverflowSet
          vertical={true}
          items={[
            {
              key: 'editsd',
              icon: 'Edit',
              name: 'Edit',
              ariaLabel: 'New. Use left and right arrow keys to navigate',
              onClick: () => this._onEditSiteDesign(item)
            },
            {
              key: 'deletesd',
              icon: 'Delete',
              name: 'Delete',
              onClick: () => this._onDeleteSiteDesign(item)
            },
            {
              key: 'provisionsd',
              icon: 'ProcessMetaTask',
              name: 'Provision',
              onClick: () => this._onDeleteSiteDesign(item)
            },
            {
              key: 'setSecurity',
              icon: 'SecurityGroup',
              name: 'Set Security',
              onClick: () => {
                alert();
              }
            },
          ]}
          overflowItems={[
            {
              key: 'setSecurity',
              icon: 'SecurityGroup',
              name: 'Set Security',
              onClick: () => {
                alert();
              }
            },
          ]}
          onRenderOverflowButton={this._onRenderOverflowButton}
          onRenderItem={this._onRenderItem}
        />
        <Image className="ms-SiteDesignViewer-itemImage" src={item.PreviewImageUrl} width={64} height={48} imageFit={ImageFit.cover} />
        <div className="ms-SiteDesignViewer-itemContent" onClick={(ev) => this._onSelectedSiteDesign(item, ev)}>
          <div className="ms-SiteDesignViewer-itemName">{item.Title} {item.IsDefault ? `(Default ${item.WebTemplate == 64 ? "Team Site" : "Communication Site"})` : null}</div>
          <div className="ms-SiteDesignViewer-itemIndex">{`${item.Id}`}</div>
          <div className="ms-SiteDesignViewer-itemDesc">{`${item.WebTemplate == 64 ? "Team Site" : "Communication Site"}`}</div>
          <div className="ms-SiteDesignViewer-itemDesc">{item.Description}</div>
          <div className="ms-SiteDesignViewer-siteScripts">Site Scripts: {siteScripts}</div>
        </div>
        {/* <Icon className="ms-SiteDesignViewer-chevron" iconName={'Edit'} onClick={() => this._onEditSiteDesign(item)} />
        <Icon className="ms-SiteDesignViewer-chevron" iconName={'Delete'} onClick={() => this._onDeleteSiteDesign(item)} />
        <Icon className="ms-SiteDesignViewer-chevron" iconName={'ProcessMetaTask'} onClick={() => this._onDeleteSiteDesign(item)} /> */}
      </div>
    );
  }

  private _onRenderItem(item: IOverflowSetItemProps): JSX.Element {
    return (
      <TooltipHost content={item.name} calloutProps={{ directionalHint: DirectionalHint.rightCenter, beakWidth: 12 }}>
        <CommandBarButton styles={{ root: { padding: '10px' } }} iconProps={{ iconName: item.icon }} onClick={item.onClick} />
      </TooltipHost>
    );
  }

  private _onRenderOverflowButton(overflowItems: any[] | undefined): JSX.Element {
    return (
      <CommandBarButton
        styles={{ root: { padding: '10px' }, menuIcon: { fontSize: '16px' } }}
        menuIconProps={{ iconName: 'More' }}
        menuProps={{ items: overflowItems! }}
      />
    );
  }

  private _onSelectedSiteDesign(item: any, ev: any) {
    item.selected = item.selected === undefined || item.selected === null ? true : !item.selected;
    const index = this.state.items.map(x => x.Id).indexOf(item.Id);
    const items = [...this.state.items];
    items[index] = item;

    const indexS = this.state.originalItems.map(x => x.Id).indexOf(item.Id);
    const itemsS = [...this.state.originalItems];
    itemsS[indexS] = item;
    this.setState({ ...this.state, originalItems: itemsS, items: items });
  }

  private _onDeleteSiteDesign = (item: any): void => {
    this.setState({ ...this.state, hideDeleteSDDialog: false, siteDesignToDelete: item });
  }

  private _onConfirmDeleteDesign = async (item: any): Promise<void> => {
    let toDeleteId = this.state.siteDesignToDelete.Id;
    await sp.siteDesigns.deleteSiteDesign(toDeleteId);
    this.setState({ ...this.state, hideDeleteSDDialog: true, siteDesignToDelete: null });
    this.props.siteDesignDeleted(toDeleteId);
  }

  private _closeDialog = (): void => {
    this.setState({ ...this.state, hideDeleteSDDialog: true });
  }

  private _onEditSiteDesign(item: any) {
    this.setState({ siteDesignToEdit: item });
  }

}