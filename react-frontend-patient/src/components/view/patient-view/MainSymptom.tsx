import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/MainSymptom.less";
import { HPatientSection } from "./HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";
import { ChronicalSection } from "./ChronicalView";
import { MainConditionSection } from "./ConditionView";
import { PainCheckSection } from "./PainView";

export abstract class MainSymptom<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainSymptomView<T extends ISectionProps> extends MainSymptom<T> {
    constructor(props: T) {
        super(props);

        const storedSymptoms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]");
        const validSymptoms = Array.isArray(storedSymptoms) ? storedSymptoms.filter((symptom) => typeof symptom === "string" && symptom.trim() !== "") : [];

        const selectedSymptom = localStorage.getItem("selectedMainSymptom") || "";

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: validSymptoms,
            selectedSymptom: selectedSymptom,
        };

        console.log("📜 Initial Symptom List:", validSymptoms);
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

        console.log("WTF " + hasPainAnswers.toString());

        let filteredAnswers;

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
            console.log("↩️ Returning to HPatientView, keeping symptoms intact.");
            filteredAnswers = answers;
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        }

        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
    };

    handleSymptomSelection = (symptom: string) => {
        this.setState({ selectedSymptom: symptom });
        localStorage.setItem("selectedMainSymptom", symptom);
    };

    saveSymptomAndProceed = (): void => {
        if (!this.state.selectedSymptom) {
            console.log("⚠️ No symptom selected.");
            return;
        }

        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ main_symptom: this.state.selectedSymptom }))) {
            answers.push({ main_symptom: this.state.selectedSymptom });
            localStorage.setItem("patientAnswers", JSON.stringify(answers));
            console.log("📜 Updated Patient Answers:", answers);
        }

        this.props.dispatch(new SwitchViewAction(MainConditionSection.defaultView));
    };

    render(): ReactNode {
        return (
            <>
            <div className="patient-view">
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                    </div>

                    <h2>What symptom are you particularly concerned about at this time? Please select just one.</h2>

                    <div className="symptom-list">
                        {this.state.selectedSymptoms.map((symptom, index) => (
                            <label key={index} className="symptom-option">
                                <input
                                    type="radio"
                                    name="symptom"
                                    value={symptom || ""}
                                    checked={this.state.selectedSymptom === symptom}
                                    onChange={() => this.handleSymptomSelection(symptom)}
                                />
                                <span className="symptom-label">{symptom}</span>
                            </label>
                        ))}
                    </div>

                    <button className="button-next" onClick={this.saveSymptomAndProceed}>To the Next</button>
                </div>
                </div>
            </>
        );
    }
}

const MainSymptomSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MainSymptomView,
};

export { MainSymptomSection };
