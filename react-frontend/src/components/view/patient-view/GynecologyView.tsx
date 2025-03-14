import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { SwitchViewAction } from "../../../data/AppAction";
import Axios from "axios";
import { AllergyMedicationSelection } from "./AllergyMedicationView";
import { SocialSelection } from "./SocialView";
import { EnumRole } from "../../../data/UserData";

export abstract class Gynecology<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class GynecologyView<T extends ISectionProps> extends Gynecology<T> {
    constructor(props: T) {
        super(props);

        this.state = {
            selectedSymptoms: [], // ✅ Persisted list of pregnancy status
        };

        console.log("📜 Initial Gynecology List:", this.state.selectedSymptoms);
    }

    handleBackClick = (): void => {
        console.log("🔙 Navigating to AllergyMedicationSelection...");
        this.props.dispatch(new SwitchViewAction(AllergyMedicationSelection.defaultView));
    };

    saveSymptomAndProceed = (pregnancyStatus: string): void => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.includes(pregnancyStatus)) {
                console.log("⚠️ Pregnancy status already selected.");
                return prevState;
            }

            const updatedSymptoms = [...prevState.selectedSymptoms, pregnancyStatus];

            // ✅ Prevent duplicate entries when switching screens
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ pregnancyStatus }))) {
                answers.push({ pregnancyStatus });
                localStorage.setItem("patientAnswers", JSON.stringify(answers)); // ✅ Store updated list
                console.log("📜 Updated Patient Answers:", answers);
            }

            // ✅ Save pregnancy status into `selectedGynecology`
            localStorage.setItem("selectedGynecology", JSON.stringify(updatedSymptoms)); // ✅ Save to storage

            console.log("📜 AAAAA:", answers);

            return { selectedSymptoms: updatedSymptoms }; // ✅ Update state
        }, () => {
            this.submitAllPatientAnswersToAPI();
        });
    };

    submitAllPatientAnswersToAPI = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
        if (answers.length === 0) {
            console.log("⚠️ No patient answers to submit.");
            return;
        }
    
        // ✅ Convert list of key-value objects into a single object
        const formattedAnswers = answers.reduce((acc, obj) => {
            return { ...acc, ...obj };
        }, {});
    
        console.log("📤 Sending formatted patient answers:", formattedAnswers);
    
        Axios.post(`/answers/info`, 
            formattedAnswers,  // ✅ Send as a single JSON object
            {
                headers: {
                    Authorization: "Bearer " + this.props.loginData.token,
                    "Content-Type": "application/json",
                }
            })
            .then((response) => {
                console.log("✅ Patient Answers Submitted:", response.data);
                localStorage.removeItem("patientAnswers"); // ✅ Clear stored answers after submission
                alert("Patient answers successfully submitted!");
            })
            .catch((error) => {
                console.error("❌ Error submitting patient answers:", error);
                alert("Error submitting patient data. Please try again.");
            });
    };    
    

    render(): ReactNode {
        return (
            <>
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>

                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                        <span className="progress-label">Basic Information</span>
                    </div>

                    <h2>Is there posibility of you to be pregnant?</h2>

                    <button className="gender-button" onClick={() => this.saveSymptomAndProceed("Yes")}>
                        Yes
                    </button>

                    <button className="gender-button" onClick={() => this.saveSymptomAndProceed("No")}>
                        No
                    </button>
                </div>
            </>
        );
    }
}

const GynecologySection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: GynecologyView,
};

export { GynecologySection };
