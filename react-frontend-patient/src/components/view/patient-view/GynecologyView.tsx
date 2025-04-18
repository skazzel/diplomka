import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/gynecology.less";
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
            selectedSymptoms: [],
            gynecologyLastCheckValue: "",
            gynecologyLastCheckUnit: "months"
        };
    }

    handleBackClick = (): void => {
        this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
    };

    saveSymptomAndProceed = (pregnancyStatus: string): void => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.includes(pregnancyStatus)) {
                return prevState;
            }

            const updatedSymptoms = [...prevState.selectedSymptoms, pregnancyStatus];

            const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

            const formattedLastCheck = prevState.gynecologyLastCheckValue
                ? `${prevState.gynecologyLastCheckValue} ${prevState.gynecologyLastCheckUnit}`
                : "";

            const entriesToSave = [
                { pregnancyStatus },
                formattedLastCheck ? { gynecologyLastCheck: formattedLastCheck } : null
            ].filter(Boolean); // remove nulls

            for (const entry of entriesToSave) {
                const exists = answers.some((a) => JSON.stringify(a) === JSON.stringify(entry));
                if (!exists) answers.push(entry);
            }

            localStorage.setItem("patientAnswers", JSON.stringify(answers));
            localStorage.setItem("selectedGynecology", JSON.stringify(updatedSymptoms));

            return { selectedSymptoms: updatedSymptoms };
        }, () => {
            this.submitAllPatientAnswersToAPI();
        });
    };

    submitAllPatientAnswersToAPI = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        if (answers.length === 0) return;

        const formattedAnswers = answers.reduce((acc, obj) => {
            return { ...acc, ...obj };
        }, {});

        Axios.post(`/answers/info`, formattedAnswers, {
            headers: {
                Authorization: "Bearer " + this.props.loginData.token,
                "Content-Type": "application/json",
            }
        })
        .then((response) => {
            console.log("✅ Submitted:", response.data);
            localStorage.removeItem("patientAnswers");
            alert("Patient answers successfully submitted!");
        })
        .catch((error) => {
            console.error("❌ Submit error:", error);
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
                        <span className="progress-label">Gynecology</span>
                    </div>

                    <h2>Is there a possibility that you are pregnant?</h2>

                    <button className="gender-button" onClick={() => this.saveSymptomAndProceed("Yes")}>
                        Yes
                    </button>
                    <button className="gender-button" onClick={() => this.saveSymptomAndProceed("No")}>
                        No
                    </button>

                    <h2 style={{ marginTop: "30px" }}>When was your last gynecological check?</h2>
                    <div className="last-check-group">
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 3"
                            onChange={(e) => this.setState({ gynecologyLastCheckValue: e.target.value })}
                            className="last-check-input"
                        />
                        <select
                            onChange={(e) => this.setState({ gynecologyLastCheckUnit: e.target.value })}
                            className="last-check-select"
                        >
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                            <option value="months" selected>months</option>
                            <option value="years">years</option>
                        </select>
                    </div>
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
