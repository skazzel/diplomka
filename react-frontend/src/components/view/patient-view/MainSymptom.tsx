import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/MainSymptom.less";
import { HPatientSection } from "./HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";
import { ChronicalSection } from "./ChronicalView";

export abstract class MainSymptom<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainSymptomView<T extends ISectionProps> extends MainSymptom<T> {
    constructor(props: T) {
        super(props);

        // Load symptoms from localStorage, filter out empty/undefined ones
        let storedSymptoms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]");

        if (!Array.isArray(storedSymptoms)) {
            storedSymptoms = [];
        }

        storedSymptoms = storedSymptoms.filter((symptom) => typeof symptom === "string" && symptom.trim() !== "");

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: storedSymptoms, 
            selectedSymptom: "", 
        };

        console.log("📜 Initial Symptom List:", this.state.selectedSymptoms);
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

            return { selectedSymptoms: updatedSymptoms };
        }, () => {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView)); // ✅ Navigate after update
        });
    };

    handleSymptomSelection = (symptom: string) => {
        this.setState({ selectedSymptom: symptom });
    };

    saveSymptomAndProceed = (): void => {
        if (!this.state.selectedSymptom) {
            console.log("⚠️ No symptom selected.");
            return;
        }

        this.setState((prevState) => {
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

            // ✅ Ensure no duplicate main symptoms are added
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ main_symptom: prevState.selectedSymptom }))) {
                answers.push({ main_symptom: prevState.selectedSymptom });
                localStorage.setItem("patientAnswers", JSON.stringify(answers)); // ✅ Store updated answers
                console.log("📜 Updated Patient Answers:", answers);
            }

            return { selectedSymptom: null }; // ✅ Reset selectedSymptom after saving
        }, () => {
            this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView)); // ✅ Navigate to the next section
        });
    };

    render(): ReactNode {
        return (
            <>
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>

                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                        <span className="progress-text">Symptoms of concern</span>
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

                    <button className="next-button" onClick={this.saveSymptomAndProceed}>To the Next</button>
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
