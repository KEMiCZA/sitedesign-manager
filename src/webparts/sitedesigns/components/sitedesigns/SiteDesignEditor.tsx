import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { connect } from 'react-redux';
import { saveSiteDesign } from '../../actions/sitedesigns-manager-actions';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TagPicker } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

export class SiteDesignEditor extends React.Component<any, any> {
  private defaultSelectedSiteScripts = [];

  constructor(props: any) {
    super(props);
    const arr_scripts = props.scripts.map(sc => ({ key: sc.Id, name: `${sc.Title} (${sc.Id})`, sc: sc }));

    this.state = {
      sd: props.sd,
      loading: false,
      allScripts: arr_scripts
    };

    this.defaultSelectedSiteScripts = props.sd.SiteScriptIds.map((sc) => {
      return arr_scripts.filter(x => x.key == sc)[0];
    });

    this._saveClicked = this._saveClicked.bind(this);
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this._getTextFromItem = this._getTextFromItem.bind(this);
    this._listcontainsSiteScript = this._listcontainsSiteScript.bind(this);
    this._siteScriptSelected = this._siteScriptSelected.bind(this);
    this._onChangeDefault = this._onChangeDefault.bind(this);
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.sd != null && this.props.sd.Id !== nextProps.sd.Id) {
      this.setState(
        {
          ...this.state,
          sd: nextProps.sd,
        });
    }
  }

  public render(): JSX.Element {
    return this.state.sd === null || this.state.sd === undefined ? null : (
      <FocusZone direction={FocusZoneDirection.vertical} disabled={this.state.loading}>
        <TextField disabled={true} value={this.state.sd.Id} label="Id" />
        <TextField label="Title" value={this.state.sd.Title} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, Title: e } })} />
        <TextField label="Description" multiline rows={4} value={this.state.sd.Description} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, Description: e } })} />
        <TextField label="Web Template" value={this.state.sd.WebTemplate} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, WebTemplate: e } })} />
        <TextField label="PreviewImageUrl" value={this.state.sd.PreviewImageUrl} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, PreviewImageUrl: e } })} />
        <TextField label="PreviewImageAltText" value={this.state.sd.PreviewImageAltText} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, PreviewImageAltText: e } })} /><br />
        <Toggle
          defaultChecked={this.state.sd.IsDefault}
          label="Default Site Design"
          onText="Yes"
          offText="No"
          onChanged={this._onChangeDefault}
        />
        Site Scripts:
        <TagPicker
          onResolveSuggestions={this._onFilterChanged}
          getTextFromItem={this._getTextFromItem}
          onChange={this._siteScriptSelected}
          defaultSelectedItems={this.defaultSelectedSiteScripts}
          pickerSuggestionsProps={{
            suggestionsHeaderText: 'Site Scripts',
            noResultsFoundText: 'No Site Scripts Found'
          }}
          inputProps={{
            'aria-label': 'Site Script Picker'
          }}
        />

        <PrimaryButton onClick={this._saveClicked} text="Save" disabled={this.state.loading} />
        <DefaultButton onClick={this._saveClicked} text="Cancel" disabled={this.state.loading} />
      </FocusZone>
    );
  }

  private _onChangeDefault(item: any) {
    this.setState(
      {
        ...this.state,
        sd: { ...this.state.sd, IsDefault: item },
      });
  }

  private _siteScriptSelected(selectedSitedesigns: any): any {
    if (selectedSitedesigns != null) {
      this.state.sd.SiteScriptIds = selectedSitedesigns.map(sd => sd.key);

      this.setState(
        {
          ...this.state,
          sd: this.state.sd,
        });
    }
  }

  private _getTextFromItem(item: any): any {
    return item.name;
  }

  private _onFilterChanged = (filterText: string, ssList: { key: string; name: string }[]): { key: string; name: string }[] => {
    return filterText
      ? this.state.allScripts
        .filter(ss => ss.name.toLowerCase().includes(filterText.toLowerCase()))
        .filter(ss => !this._listcontainsSiteScript(ss, ssList))
      : [];
  }

  private _saveClicked() {
    this.setState({ ...this.state, loading: true });
    this.props.saveSiteDesign(this.state.sd);
  }

  private _listcontainsSiteScript(ss: { key: string; name: string }, ssList: { key: string; name: string }[]) {
    if (!ssList || !ssList.length || ssList.length === 0) {
      return false;
    }
    return ssList.filter(compareSS => compareSS.key === ss.key).length > 0;
  }
}

const mapStateToProps = (state: any): any => {
  return {
    items: state.sitedesigns,
    scripts: state.sitescripts,
    loading: false,
    sd: state.selectedSiteDesign,
  };
};

export default connect(mapStateToProps, { saveSiteDesign })(SiteDesignEditor);