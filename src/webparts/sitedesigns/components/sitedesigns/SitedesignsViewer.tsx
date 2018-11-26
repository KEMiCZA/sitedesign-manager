import * as React from 'react';
import { getRTL } from 'office-ui-fabric-react/lib/Utilities';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { List } from 'office-ui-fabric-react/lib/List';
import './List.Basic.SiteDesignViewer.css';
import { connect } from 'react-redux';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { editSiteDesign, deleteSiteDesign, loadInitialSiteDesignAndScripts } from '../../actions/sitedesigns-manager-actions';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

export interface ISiteDesignViewerProps {
  items: any[];
}

export interface ISiteDesignViewerState {
  filterText?: string;
  items?: any[];
  hideDeleteSDDialog: boolean;
  siteDesignToDelete: any;
}

export class SitedesignsViewer extends React.Component<any, ISiteDesignViewerState> {
  private _selection: Selection;

  constructor(props: ISiteDesignViewerProps) {
    super(props);
    this.state = {
      filterText: '',
      items: props.items,
      hideDeleteSDDialog: true,
      siteDesignToDelete: null
    };
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this._onEditSiteDesign = this._onEditSiteDesign.bind(this);
    this._onDeleteSiteDesign = this._onDeleteSiteDesign.bind(this);
    this._closeDialog = this._closeDialog.bind(this);
    this._onConfirmDeleteDesign = this._onConfirmDeleteDesign.bind(this);

    this._selection = new Selection();
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

    const { items: originalItems } = this.props;
    const { items } = this.state.filterText ? this.state : this.props;
    const resultCountText = items.length === originalItems.length ? '' : ` (${items.length} of ${originalItems.length} shown)`;
    return (
      <FocusZone direction={FocusZoneDirection.vertical}>
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
    let _menuButtonElement: HTMLElement | null;
    const siteScripts = item.SiteScriptIds.map(scId => {
      const scCalc = this.props.scripts.filter(sc => sc.Id == scId)[0];
      return (
        <a onClick={(a) => alert(scCalc.Id)}>{scCalc.Title}</a>
      );
    });

    return (
      <div className="ms-SiteDesignViewer-itemCell" data-is-focusable={true} ref={menuButton => (_menuButtonElement = menuButton)}>
        <Image className="ms-SiteDesignViewer-itemImage" src={item.PreviewImageUrl} width={64} height={48} imageFit={ImageFit.cover} />
        <div className="ms-SiteDesignViewer-itemContent">
          <div className="ms-SiteDesignViewer-itemName">{item.Title} {item.IsDefault ? "(Default)" : null}</div>
          <div className="ms-SiteDesignViewer-itemIndex">{`${item.Id}`}</div>
          <div className="ms-SiteDesignViewer-itemDesc">{item.Description}</div>
          <div className="ms-SiteDesignViewer-siteScripts">Site Scripts: {siteScripts}</div>
        </div>
        <Icon className="ms-SiteDesignViewer-chevron" iconName={'Edit'} onClick={() => this._onEditSiteDesign(item)} />
        <Icon className="ms-SiteDesignViewer-chevron" iconName={'Delete'} onClick={() => this._onDeleteSiteDesign(item)} />
        <Icon className="ms-SiteDesignViewer-chevron" iconName={'ProcessMetaTask'} onClick={() => this._onDeleteSiteDesign(item)} />
      </div>
    );
  }

  private _onDeleteSiteDesign = (item: any): void => {
    this.setState({ ...this.state, hideDeleteSDDialog: false, siteDesignToDelete: item });
  }

  private _onConfirmDeleteDesign = (item: any): void => {
    this.props.deleteSiteDesign(this.state.siteDesignToDelete.Id).then(x => {
      this.props.loadInitialSiteDesignAndScripts();
    });

    this.setState({ ...this.state, hideDeleteSDDialog: true, siteDesignToDelete: null });
  }

  private _closeDialog = (): void => {
    this.setState({ ...this.state, hideDeleteSDDialog: true });
  }

  private _onEditSiteDesign(item: any) {
    this.props.editSiteDesign(item);
  }

}
const mapStateToProps = (state: any): any => {
  return {
    items: state.sitedesigns,
    scripts: state.sitescripts,
  };
};

export default connect(mapStateToProps, { editSiteDesign, deleteSiteDesign, loadInitialSiteDesignAndScripts })(SitedesignsViewer);