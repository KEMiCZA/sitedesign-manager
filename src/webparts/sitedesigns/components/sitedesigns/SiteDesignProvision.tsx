import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { connect } from 'react-redux';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TagPicker } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { FormTypeEnum } from '../enums/FormTypeEnum';
import { sp } from '@pnp/sp';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import styles from '../Sitedesigns.module.scss';
import { siteDesignAdded, siteDesignUpdated } from '../../actions/sitedesigns-manager-actions';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

export interface ISiteDesignFormProps {
  formType: FormTypeEnum;
  doneCallback: () => void;
  sd?: any;
}

export interface ISiteDesignFormMapActionsToProps {
  siteDesignAdded?: typeof siteDesignAdded;
  siteDesignUpdated?: typeof siteDesignUpdated;
}

export interface ISiteDesignFormApplicationStateToProps {
  scripts?: any;
}

const mapApplicationStateToProps = (state: any): any => {
  return {
    scripts: state.sitescripts
  };
};

export interface ISiteDesignState {
  loading: boolean;
  allScripts: any;
  sd: any;
  requiredTexts: { [id: string]: string };
  errorMessageAfterSave: string;
}

@connect(mapApplicationStateToProps, { siteDesignAdded, siteDesignUpdated })
export class SiteDesignProvision extends React.Component<ISiteDesignFormProps & ISiteDesignFormApplicationStateToProps & ISiteDesignFormMapActionsToProps, ISiteDesignState> {
  private defaultSelectedSiteScripts = [];

  constructor(props: any) {
    super(props);
    const arr_scripts = props.scripts.map(sc => ({ key: sc.Id, name: sc.Title, sc: sc }));

    this.state = {
      loading: false,
      allScripts: arr_scripts,
      sd: { ...props.sd },
      requiredTexts: { "title": null, "webtemplate": null },
      errorMessageAfterSave: null
    };

    if (this.props.formType == FormTypeEnum.Edit) {
      this.defaultSelectedSiteScripts = props.sd.SiteScriptIds.map((sc) => {
        return arr_scripts.filter(x => x.key == sc)[0];
      });
    }

    this._saveClicked = this._saveClicked.bind(this);
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this._getTextFromItem = this._getTextFromItem.bind(this);
    this._listcontainsSiteScript = this._listcontainsSiteScript.bind(this);
    this._siteScriptSelected = this._siteScriptSelected.bind(this);
    this._onChangeDefault = this._onChangeDefault.bind(this);
    this._closeDialog = this._closeDialog.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  public render(): JSX.Element {
    const errMessage = this.state.errorMessageAfterSave !== null ? <MessageBar
      messageBarType={MessageBarType.blocked}
      isMultiline={false}
      onDismiss={() => this.setState({ ...this.state, errorMessageAfterSave: null })}
      dismissButtonAriaLabel="Close"
      truncated={true}
      overflowButtonAriaLabel="More...">(┛ಠ_ಠ)┛彡┻━┻  Message:  {this.state.errorMessageAfterSave}</MessageBar> : null;

    return this.state.sd === null || this.state.sd === undefined ? null : (
      <FocusZone direction={FocusZoneDirection.horizontal} >
        <Dialog
          hidden={false}
          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Site Design Editor',
          }}
          modalProps={{
            isBlocking: false,
            isDarkOverlay: false,
            containerClassName: styles.msDialogMainOverride
          }}
        >

          {errMessage}

          {this.props.formType === FormTypeEnum.New ? null : (<TextField tabIndex={-1} disabled={true} value={this.state.sd.Id} label="Id" />)}
          <TextField tabIndex={1} required={true} label="Title" errorMessage={this.state.requiredTexts["title"]} value={this.state.sd.Title} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, Title: e }, requiredTexts: { ...this.state.requiredTexts, "title": null } })} />
          <TextField tabIndex={20} label="Description" multiline rows={4} value={this.state.sd.Description} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, Description: e } })} />
          <Dropdown
            errorMessage={this.state.requiredTexts["webtemplate"]}
            label="Web Template"
            tabIndex={30}
            placeholder="Web Template"
            id="WebTemplateDropDown"
            options={[
              { key: '64', text: 'Team Site' },
              { key: '68', text: 'Communication Site' }
            ]}
            required={true}
            defaultSelectedKey={this.state.sd.WebTemplate}
            onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, WebTemplate: e.key }, requiredTexts: { ...this.state.requiredTexts, "webtemplate": null } })}
          />
          <TextField tabIndex={40} label="PreviewImageUrl" value={this.state.sd.PreviewImageUrl} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, PreviewImageUrl: e } })} />
          <TextField tabIndex={50} label="PreviewImageAltText" value={this.state.sd.PreviewImageAltText} onChanged={(e) => this.setState({ ...this.state, sd: { ...this.state.sd, PreviewImageAltText: e } })} /><br />
          <Toggle
            defaultChecked={this.state.sd.IsDefault}
            label="Default Site Design"
            onText="Yes"
            offText="No"
            onChanged={this._onChangeDefault}
            tabIndex={60}
          />
          Site Scripts:
          <TagPicker
            onResolveSuggestions={this._onFilterChanged}
            getTextFromItem={this._getTextFromItem}
            onChange={this._siteScriptSelected}
            defaultSelectedItems={this.defaultSelectedSiteScripts}
            pickerSuggestionsProps={{
              suggestionsHeaderText: 'Site Scripts',
              noResultsFoundText: 'No Site Scripts Found',
              resultsMaximumNumber: 100,
            }}
            inputProps={{
              'aria-label': 'Tag Picker',
            }}
          />

          <DialogFooter>
            <PrimaryButton onClick={this._saveClicked} disabled={this.state.loading}>{this.props.formType == FormTypeEnum.New ? "Create" : "Save"} {this.state.loading ? (<Spinner size={SpinnerSize.xSmall}></Spinner>) : null}</PrimaryButton>
            <DefaultButton onClick={this._closeDialog} text="Cancel" disabled={this.state.loading} />
          </DialogFooter>

        </Dialog>
      </FocusZone>
    );
  }

  private _closeDialog() {
    this.props.doneCallback();
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
    return item.sc.Title;
  }

  private _onFilterChanged = (filterText: string, ssList: { key: string; name: string }[]): { key: string; name: string }[] => {
    return filterText
      ? this.state.allScripts
        .filter(ss => ss.key.toLowerCase().includes(filterText.toLowerCase()) || ss.sc.Title.toLowerCase().includes(filterText.toLowerCase()))
        .filter(ss => !this._listcontainsSiteScript(ss, ssList))
      : [];
  }

  private validateForm(): boolean {
    let isValid = true;
    let requiredTextsClone = { ...this.state.requiredTexts };

    if (this.state.sd.Title === undefined || this.state.sd.Title === null || this.state.sd.Title === "") {
      requiredTextsClone["title"] = "Required";
      isValid = false;
    }

    if (this.state.sd.WebTemplate === undefined || this.state.sd.WebTemplate === null || this.state.sd.WebTemplate === "") {
      requiredTextsClone["webtemplate"] = "Required";
      isValid = false;
    }

    if (!isValid) {
      this.setState({ ...this.state, requiredTexts: requiredTextsClone });
    }

    return isValid;
  }

  private async _saveClicked() {
    if (this.validateForm()) {
      this.setState({ ...this.state, loading: true });
      const newValue = { ...this.state.sd };
      switch (this.props.formType) {
        case FormTypeEnum.Edit:
          try {
            newValue["selected"] = undefined;
            newValue["odata.metadata"] = undefined;
            let result = await sp.siteDesigns.updateSiteDesign(newValue);
            this.props.siteDesignUpdated(result);
            this._closeDialog();
          } catch (ex) {
            let errResult = await ex.response.json();
            this.setState({ ...this.state, loading: false, errorMessageAfterSave: errResult["odata.error"]["message"].value });
          }
          break;
        case FormTypeEnum.New:
          try {
            let result = await sp.siteDesigns.createSiteDesign(newValue);
            this.props.siteDesignAdded(result);
            this._closeDialog();
          } catch (ex) {
            let errResult = await ex.response.json();
            this.setState({ ...this.state, loading: false, errorMessageAfterSave: errResult["odata.error"]["message"].value });
          }
          break;
        default:
          break;
      }
    }
  }

  private _listcontainsSiteScript(ss: { key: string; name: string }, ssList: { key: string; name: string }[]) {
    if (!ssList || !ssList.length || ssList.length === 0) {
      return false;
    }
    return ssList.filter(compareSS => compareSS.key === ss.key).length > 0;
  }
}