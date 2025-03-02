import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/patient-quiz.less";
import { GenderInfoSection } from "./GenderView";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";

import {EnumRole} from "../../../data/UserData";
import { MainSymptomSection } from "./MainSymptom";
import { BadHabbitsSection } from "./BadHabbits";
import { AllergyFood, AllergyFoodSelection } from "./AllergyFoodView";

export abstract class Pharmacology<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PharmacologyView<T extends ISectionProps> extends Pharmacology<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
        };
    }

    handleBackClick = (): void => {
        console.log("Switching back to BodyImageView");
        this.props.dispatch(new SwitchViewAction(BadHabbitsSection.defaultView));
    };

    handleNextClick = (): void => {
        console.log("Switching back to BodyImageView");
        localStorage.setItem("selectedSymptoms", JSON.stringify(this.state.selectedSymptoms));
        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
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
            <div className="pharma-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="pharma-container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What medication are you currently taking?</h2>
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
                                placeholder={displayName ?? "Vyberte symptom..."} 
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
                        <span>Ibalgin</span>
                        <span>Heparin</span>
                        <span>Biseptol</span>
                        <span>Acylpyrin</span>
                    </div>

                    <div className="selected-symptoms-container">
                        <h3>This medication you are taking?</h3>
                        <div className="scrollable-selected-symptoms">
                            <ul className="selected-symptoms-list">
                                {this.state.selectedSymptoms.map((symptom, index) => (
                                    <li key={index}>
                                        • {symptom}  
                                        <span className="delete-symptom" onClick={() => this.removeSymptom(symptom)}>
                                            🗑️ delete
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        {/* ✅ Back Button - Switches to BodyImageView */}
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
const PharmacologySection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: PharmacologyView,
};

export { PharmacologySection };
