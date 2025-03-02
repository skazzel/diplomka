import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/chronical.less";
import { GenderInfoSection } from "./GenderView";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";

import {EnumRole} from "../../../data/UserData";
import { MainSymptomSection } from "./MainSymptom";
import { BadHabbitsSection } from "./BadHabbits";

export abstract class Chronical<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class ChronicalView<T extends ISectionProps> extends Chronical<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
        };
    }

    handleBackClick = (): void => {
        console.log("Switching back to BodyImageView");
        this.props.dispatch(new SwitchViewAction(MainSymptomSection.defaultView));
    };

    handleNextClick = (): void => {
        console.log("Switching back to BodyImageView");
        localStorage.setItem("selectedSymptoms", JSON.stringify(this.state.selectedSymptoms));
        this.props.dispatch(new SwitchViewAction(BadHabbitsSection.defaultView));
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState(prevState => ({
            selectedSymptoms: prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove)
        }));
    };

    handleSelectSymptom = (symptom: string) => {
        this.setState((prevState) => ({
            selectedSymptoms: [...prevState.selectedSymptoms, symptom],
        }));
    };

    toggleDateInput = (): void => {
        const dateInput = document.getElementById("operation-date");
        const yesRadio = document.querySelector("input[name='operation'][value='yes']");
        dateInput.style.display = yesRadio.checked ? "block" : "none";
    }

    performSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        const symptom = e.target.value.trim();

        if (typeof this.state.searchTimeout !== "undefined")
        {
            clearTimeout(this.state.searchTimeout);
        }

        this.setState(() => ({
            errorText: "",
            searchString: symptom
        }));

        if (symptom === "")
        {
            this.setState(() => ({
                userSearch: []
            }));

            return;
        }

        const timeout = window.setTimeout(() => {
            console.log("Value:", symptom);

            Axios.get("/symptoms/info",
                {
                    params: {
                        symptom: symptom + "%",
                        role: this.props.searchRole === EnumRole.PATIENT
                    },
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + this.props.loginData.token 
                    }
                }
            ).then((response) => {

                if (Array.isArray(response.data)) {
                    this.setState(() => ({
                        userSearch: response.data
                    }));
                } else {
                    console.log("❌ Unexpected API response format:", response.data);
                    this.setState(() => ({
                        errorText: "Unexpected API response format."
                    }));
                }
            }).catch(() => {
                this.setState(() => ({
                    errorText: "Došlo k chybě při vyhledávání, prosím zkuste to znovu později."
                }));
            });
        }, 350);

        this.setState({
            searchTimeout: timeout
        });
    }

    render(): ReactNode {
        let displayName: string | null = null;

        if (typeof this.props.managedUser !== "undefined")
        {
            if (this.props.managedUser.birthDate !== null)
            {
                displayName = `${this.props.managedUser.name} ${this.props.managedUser.surname}, narozen(a) ${this.props.managedUser.birthDate}`;
            }
            else
            {
                displayName = `${this.props.managedUser.name} ${this.props.managedUser.surname}`;
            }
        }

        return (
            <div className="chronical-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="chronical-container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>Do you suffer from any chronical desease?</h2>
                    <VBox className="scrollable-search-container"> {/* ✅ Added Scrollable Wrapper */}
                        <HBox>
                            <input 
                                key={this.state.searchKey} 
                                type="text"
                                value={this.state.searchString} 
                                onClick={event => {
                                    if (displayName !== null) {
                                        (event.target as HTMLInputElement).value = "";
                                    }
                                }} 
                                onChange={this.performSearch} 
                                placeholder={displayName ?? "Vyberte nemoc..."} 
                            />
                        </HBox>

                        {this.state.errorText && (
                            <div className="hs-userbox-error">
                                {this.state.errorText}
                            </div>
                        )}

                        {this.state.searchString && (
                            <div className="scrollable-results">
                                <table className="hs-userbox-table">
                                    <colgroup>
                                        <col span={1} className="hs-userbox-col-name" />
                                        <col span={1} className="hs-userbox-col-controls" />
                                    </colgroup>
                                    <tbody>
                                        {this.state.userSearch?.map(result => (
                                            <tr className="hs-userbox-result" key={result.id}>
                                                <td className="hs-userbox-result-name">
                                                    {result.symptom}
                                                </td>
                                                <td className="hs-userbox-controls">
                                                <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => { this.handleSelectSymptom(result.symptom); }} >
                                                        Vybrat
                                                    </HButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </VBox>

                    <div className="tags">
                        <span>Cukrovka</span>
                        <span>Vysoký tlak</span>
                        <span>Astma</span>
                        <span>Rakovina</span>
                    </div>

                    <h2>Did you have any surgeries recently?</h2>
                    <div className="radio-group">
                        <label><input type="radio" name="operation" value="yes" onClick={this.toggleDateInput}/> Yes</label>
                        <label><input type="radio" name="operation" value="no" onClick={this.toggleDateInput}/> No</label>
                    </div>

                    <div id="operation-date">
                        <h2>If yes, select the date:</h2>
                        <input type="date" className="input-field"/>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button
                            className="button"
                            onClick={this.handleNextClick}>Next</button>
                    </div>
                </div>
            </div>
        );
    }
}

/** ✅ Updated Section Export */
const ChronicalSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: ChronicalView,
};

export { ChronicalSection };
