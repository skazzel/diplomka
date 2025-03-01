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
import { AllergyMedicationSelection } from "./AllergyMedicationView";
import { PharmacologySection } from "./PharmacologyView";

export abstract class AllergyFood<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class AllergyFoodView<T extends ISectionProps> extends AllergyFood<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
        };
    }

    handleBackClick = (): void => {
        console.log("Switching back to BodyImageView");
        this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView));
    };

    handleNextClick = (): void => {
        console.log("Switching back to BodyImageView");
        localStorage.setItem("selectedSymptoms", JSON.stringify(this.state.selectedSymptoms));
        this.props.dispatch(new SwitchViewAction(AllergyMedicationSelection.defaultView));
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
            <div className="patient-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="patient-container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What symptom bothers you the most?</h2>
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
                        <span>My stomach hurts</span>
                        <span>Fever</span>
                        <span>Tired</span>
                        <span>Headache</span>
                        <span>Sore throat</span>
                        <span>Nausea</span>
                    </div>
                    <div className="example">
                        <span>Try entering a short sentence.</span>
                        <span className="good">Good example: "My stomach hurts"</span>
                        <span className="bad">Bad example: "Yesterday when I woke up I had a stomach ache, but now it's a little better."</span>
                    </div>

                    <div className="selected-symptoms-container">
                        <h3>Are you currently experiencing any of the following symptoms?</h3>
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
const AllergyFoodSelection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: AllergyFoodView,
};

export { AllergyFoodSelection };
