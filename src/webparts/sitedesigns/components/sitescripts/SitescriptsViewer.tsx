import * as React from 'react';
import { getRTL } from 'office-ui-fabric-react/lib/Utilities';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { List } from 'office-ui-fabric-react/lib/List';
import './List.Basic.SiteScriptViewer.css';
import { connect } from 'react-redux';

export interface ISiteScriptViewerProps {
  items: any[];
}

export interface ISiteScriptViewerState {
  filterText?: string;
  items?: any[];
}

export class SitescriptsViewer extends React.Component<any, ISiteScriptViewerState> {
  constructor(props: ISiteScriptViewerProps) {
    super(props);
    this.state = {
      filterText: '',
      items: props.items
    };
    this._onFilterChanged = this._onFilterChanged.bind(this);
  }

  public render(): JSX.Element {
    const { items: originalItems } = this.props;
    const { items } = this.state.filterText ? this.state : this.props;
    const resultCountText = items.length === originalItems.length ? '' : ` (${items.length} of ${originalItems.length} shown)`;
    return (
      <FocusZone direction={FocusZoneDirection.vertical}>
        <TextField label={'Filter by title, id or description' + resultCountText} onBeforeChange={this._onFilterChanged} />
        <List items={items} onRenderCell={this._onRenderCell} />
      </FocusZone>
    );
  }

  private _onFilterChanged(text: string): void {
    const { items } = this.props;

    this.setState({
      filterText: text,
      items: text ? items.filter(item => item.Title.toLowerCase().indexOf(text.toLowerCase()) >= 0
        || item.Id.toLowerCase().indexOf(text.toLowerCase()) >= 0
        || item.Description.toLowerCase().indexOf(text.toLowerCase()) >= 0)
        : items
    });
  }

  private _onRenderCell(item: any, index: number | undefined): JSX.Element {
    console.log(item);
    return (
      <div className="ms-SiteScriptViewer-itemCell" data-is-focusable={true}>
        <Image className="ms-SiteScriptViewer-itemImage" src={item.PreviewImageUrl} width={64} height={48} imageFit={ImageFit.cover} />
        <div className="ms-SiteScriptViewer-itemContent">
          <div className="ms-SiteScriptViewer-itemName">{item.Title} {item.IsDefault ? "(Default)" : null}</div>
          <div className="ms-SiteScriptViewer-itemIndex">{`Id ${item.Id}`}</div>
          <div className="ms-SiteScriptViewer-itemDesc">{item.Description}</div>
        </div>
        <Icon className="ms-SiteScriptViewer-chevron" iconName={getRTL() ? 'ChevronLeft' : 'ChevronRight'} />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    items: state.sitescripts
  };
};

export default connect(mapStateToProps, {})(SitescriptsViewer);