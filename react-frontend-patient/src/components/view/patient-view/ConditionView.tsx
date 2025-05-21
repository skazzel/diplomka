import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode, ChangeEvent } from "react";
import "../../../style/condition.less";
import { GenderInfoSection } from "../patient-view/GenderView";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";

import { EnumRole } from "../../../data/UserData";
import { MainSymptomSection } from "./MainSymptom";
import { ChronicalSection } from "./ChronicalView";
import { PainCheckSection } from "./PainView";

export abstract class MainCondition<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainConditionView<T extends ISectionProps> extends MainCondition<T> {
    constructor(props: T) {
        super(props);
        const storedCondition = localStorage.getItem("selectedCondition") || "";
        const storedPreviousTrouble = localStorage.getItem("previousTrouble") || "";
        const storedNumber = localStorage.getItem("durationNumber") || "";
        const storedUnit = localStorage.getItem("durationUnit") || "";

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
            selectedCondition: storedCondition,
            selectedNumber: storedNumber,
            selectedUnit: storedUnit,
            previousTrouble: storedPreviousTrouble,
            searchString: "",
            searchTimeout: undefined,
            userSearch: [],
            errorText: ""
        };
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
        const hasPainAnswers = answers.some((entry: any) =>
            entry.hasOwnProperty("painType") ||
            entry.hasOwnProperty("painChange") ||
            entry.hasOwnProperty("painWorse") ||
            entry.hasOwnProperty("painRelief") ||
            entry.hasOwnProperty("painIntensity") ||
            entry.hasOwnProperty("painTime")
        );
    
        const hasMultipleSymptoms = answers.some((entry: any) =>
            Array.isArray(entry.symptoms) && entry.symptoms.length > 1
        );
    
        console.log("📊 Pain-related entries exist:", hasPainAnswers);
        console.log("📊 Multiple symptoms selected:", hasMultipleSymptoms);
    
        let filteredAnswers;
    
        if (hasMultipleSymptoms) {
            console.log("↩️ Více symptomů – vracím se do výběru symptomů.");
            this.props.dispatch(new SwitchViewAction(MainSymptomSection.defaultView));
            return;
        }
    
        if (hasPainAnswers) {
            filteredAnswers = answers.filter((entry: any) =>
                !(
                    entry.hasOwnProperty("painType") ||
                    entry.hasOwnProperty("painChange") ||
                    entry.hasOwnProperty("painWorse") ||
                    entry.hasOwnProperty("painRelief") ||
                    entry.hasOwnProperty("painIntensity") ||
                    entry.hasOwnProperty("painTime")
                )
            );
    
            console.log("🗑️ Removed pain-related entries:", filteredAnswers);
            this.props.dispatch(new SwitchViewAction(PainCheckSection.defaultView));
        } else {
            filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("main_symptom"));
            console.log("↩️ Returning to HPatientView, keeping symptoms intact.");
            this.props.dispatch(new SwitchViewAction(MainSymptomSection.defaultView));
        }
    
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
    };    

    handleSelect = (field: string, value: string) => {
        this.setState({ [field]: value });
        localStorage.setItem(field, value);
    };

    saveSymptomAndProceed = (): void => {
        const numberValue = this.selectedNumber?.value;
        const unitValue = this.selectedUnit?.value;
        const { selectedCondition, previousTrouble } = this.state;

        if (!numberValue || !unitValue || unitValue === "---" || selectedCondition === "---" || previousTrouble === "---") {
            console.log("⚠️ Missing values in form.");
            return;
        }

        localStorage.setItem("durationNumber", numberValue);
        localStorage.setItem("durationUnit", unitValue);

        const fullDuration = `${numberValue} ${unitValue}`;

        this.setState((prevState) => {
            let answers: any[] = [];
            try {
                const stored = localStorage.getItem("patientAnswers");
                answers = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(answers)) {
                    answers = [];
                }
            } catch (e) {
                answers = [];
            }

            const entriesToSave = [
                { symptoms: prevState.selectedSymptoms },
                { condition: selectedCondition },
                { previousTrouble },
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

        if (typeof this.state.searchTimeout !== "undefined") {
            clearTimeout(this.state.searchTimeout);
        }

        this.setState(() => ({
            errorText: "",
            searchString: symptom
        }));

        if (symptom === "") {
            this.setState(() => ({
                userSearch: []
            }));
            return;
        }

        const timeout = window.setTimeout(() => {
            Axios.get("/symptoms/info", {
                params: {
                    symptom: symptom,
                    role: this.props.searchRole === EnumRole.PATIENT
                },
                method: "GET",
                headers: {
                    Authorization: "Bearer " + this.props.loginData.token
                }
            }).then((response) => {
                if (Array.isArray(response.data)) {
                    this.setState(() => ({
                        userSearch: response.data
                    }));
                } else {
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
    };

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container" id="symptom-input">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                    </div>

                    <div className="symptom-row">
                        <label className="symptom-label">Are your symptoms getting better or worse?</label>
                        <select className="symptom-select" value={this.state.selectedCondition} onChange={(e) => this.handleSelect("selectedCondition", e.target.value)}>
                            <option value="">---</option>
                            <option value="Better">Better</option>
                            <option value="Worse">Worse</option>
                            <option value="No change">No change</option>
                        </select>
                    </div>

                    <div className="symptom-row">
                        <label className="symptom-label">How long have you had these symptoms?</label>
                        <div className="duration-input-group">
                            <select className="symptom-select" ref={(ref) => (this.selectedNumber = ref)} defaultValue={this.state.selectedNumber} onChange={(e) => localStorage.setItem("durationNumber", e.target.value)}>
                                <option value="">---</option>
                                {[...Array(31)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                            <select className="symptom-select" ref={(ref) => (this.selectedUnit = ref)} defaultValue={this.state.selectedUnit} onChange={(e) => localStorage.setItem("durationUnit", e.target.value)}>
                                <option value="">---</option>
                                <option value="hours">hours</option>
                                <option value="days">days</option>
                                <option value="weeks">weeks</option>
                                <option value="years">years</option>
                            </select>
                        </div>
                    </div>

                    <div className="symptom-row">
                        <label className="symptom-label">Have you had these problems before?</label>
                        <select className="symptom-select" value={this.state.previousTrouble} onChange={(e) => this.handleSelect("previousTrouble", e.target.value)}>
                            <option value="">---</option>
                            <option value="Yes, repeatedly">Yes, repeatedly</option>
                            <option value="Yes, once">Yes, once</option>
                            <option value="No, never">No, never</option>
                            <option value="I don't know">I don't know</option>
                        </select>
                    </div>

                    <div>
                        <button className="button-next" onClick={this.saveSymptomAndProceed}>Next</button>
                    </div>
                </div>
            </div>
        );
    }
}

const MainConditionSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MainConditionView,
};

export { MainConditionSection };
