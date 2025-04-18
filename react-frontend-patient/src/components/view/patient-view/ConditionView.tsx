import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/condition.less";
import { GenderInfoSection } from "../patient-view/GenderView";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";

import {EnumRole} from "../../../data/UserData";
import { MainSymptomSection } from "./MainSymptom";
import { ChronicalSection } from "./ChronicalView";

export abstract class MainCondition<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainConditionView<T extends ISectionProps> extends MainCondition<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
            selectedCondition: "",
            selectedNumber: "",
            selectedUnit: "",
            previousTrouble: "",
        };
    }

    handleBackClick = (): void => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.length === 0) {
                console.log("No symptoms to remove.");
                return prevState;
            }

            const updatedSymptoms = [...prevState.selectedSymptoms];
            updatedSymptoms.pop(); // ✅ Remove last symptom

            localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms)); // ✅ Save updated list
            console.log("📜 Updated Symptom List (After Back):", updatedSymptoms); // ✅ Print full list after removal

            return { selectedSymptoms: updatedSymptoms };
        }, () => {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView)); // ✅ Navigate after update
        });
    };

    handleSelectCondition = (condition: string) => {
        this.setState((prevState) => {
            const updatedCondition = [...prevState.selectedCondition, condition];

            localStorage.setItem("selectedCondition", JSON.stringify(updatedCondition)); // ✅ Save updated symptoms
            console.log("📜 Updated Condition:", updatedCondition);

            return { selectedCondition: condition };
        });
    };

    saveSymptomAndProceed = (): void => {
        const numberValue = this.selectedNumber?.value;
        const unitValue = this.selectedUnit?.value;
    
        if (!numberValue || !unitValue) {
            console.log("⚠️ Duration number or unit is missing.");
            return;
        }
    
        const fullDuration = `${numberValue} ${unitValue}`;
    
        this.setState((prevState) => {
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
            const entriesToSave = [
                { symptoms: prevState.selectedSymptoms },
                { condition: prevState.selectedCondition },
                { previousTrouble: prevState.previousTrouble },
                { duration: fullDuration }
            ];
    
            for (const entry of entriesToSave) {
                const isDuplicate = answers.some(
                    (existing) => JSON.stringify(existing) === JSON.stringify(entry)
                );
                if (!isDuplicate) {
                    answers.push(entry);
                }
            }
    
            localStorage.setItem("patientAnswers", JSON.stringify(answers));
            console.log("📦 Updated patientAnswers:", answers);
    
            return {
                selectedSymptom: null,
                selectedNumber: numberValue,
                selectedUnit: unitValue,
                selectedDate: fullDuration
            };
        }, () => {
            this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
        });
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

            Axios.get("/symptoms/info",
                {
                    params: {
                        symptom: symptom,
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

                    <div className="symptom-trend-container">
                        <h3>Are your symptoms getting better or worse?</h3>
                        <div className="symptom-trend-options">
                            <span
                                className={`symptomTrend ${this.state.selectedCondition === "Better" ? "selected" : ""}`}
                                onClick={() => this.handleSelectCondition("Better")}
                            >
                                better
                            </span>
                            <span
                                className={`symptomTrend ${this.state.selectedCondition === "Worse" ? "selected" : ""}`}
                                onClick={() => this.handleSelectCondition("Worse")}
                            >
                                worse
                            </span>
                            <span
                                className={`symptomTrend ${this.state.selectedCondition === "No change" ? "selected" : ""}`}
                                onClick={() => this.handleSelectCondition("No change")}
                            >
                                no change
                            </span>
                        </div>
                    </div>

                    <div className="symptom-duration-container">
                        <h3>How long have you had these symptoms?</h3>
                        <div className="duration-input-group">
                            <input ref={(ref) => (this.selectedNumber = ref)} type="number" min="0" placeholder="e.g. 3" className="duration-number-input" />
                            <select ref={(ref) => (this.selectedUnit = ref)} className="duration-unit-select">
                                <option value="hours">hours</option>
                                <option value="days">days</option>
                                <option value="weeks">weeks</option>
                                <option value="years">years</option>
                            </select>
                        </div>
                    </div>

                    <div className="previous-troubles-container">
                        <h3>Have you had these problems before?</h3>
                        <div className="previous-troubles-options">
                            {["Yes, repeatedly", "Yes, once", "No, never", "I don't know"].map((option) => (
                                <span
                                    key={option}
                                    className={`previousTroubleOption ${this.state.previousTrouble === option ? "selected" : ""}`}
                                    onClick={() => this.setState({ previousTrouble: option })}
                                >
                                    {option}
                                </span>
                            ))}
                        </div>
                    </div>


                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        {/* ✅ Back Button - Switches to BodyImageView */}
                        <button
                            className="button"
                            onClick={this.saveSymptomAndProceed}>Next</button>
                    </div>
                </div>
            </div>
        );
    }
}

/** ✅ Updated Section Export */
const MainConditionSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MainConditionView,
};

export { MainConditionSection };
