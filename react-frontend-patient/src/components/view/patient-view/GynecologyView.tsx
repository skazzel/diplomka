import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
//import "../../../style/gynecology.less";
import { SwitchViewAction } from "../../../data/AppAction";
import Axios from "axios";
import { AllergyMedicationSelection } from "./AllergyMedicationView";
import { SocialSelection } from "./SocialView";

export abstract class Gynecology<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class GynecologyView<T extends ISectionProps> extends Gynecology<T> {
    constructor(props: T) {
        super(props);

        const stored = JSON.parse(localStorage.getItem("gynecologyInfo") || "{}");

        this.state = {
            selectedSymptoms: [],
            pregnancyStatus: stored.pregnancyStatus || "",
            pregnancyWeek: stored.pregnancyWeek || "",
            gynecologyLastCheckValue: stored.gynecologyLastCheckValue || "",
            gynecologyLastCheckUnit: stored.gynecologyLastCheckUnit || "months"
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("gynecologyInfo", JSON.stringify({
            pregnancyStatus: this.state.pregnancyStatus,
            pregnancyWeek: this.state.pregnancyWeek,
            gynecologyLastCheckValue: this.state.gynecologyLastCheckValue,
            gynecologyLastCheckUnit: this.state.gynecologyLastCheckUnit
        }));
    }

    handleBackClick = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers = answers.filter((entry: any) => !entry.hasOwnProperty("employmentStatus"));
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
    };

    handleSave = (): void => {
        const {
            pregnancyStatus,
            pregnancyWeek,
            gynecologyLastCheckValue,
            gynecologyLastCheckUnit
        } = this.state;

        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        const formattedLastCheck = gynecologyLastCheckValue
            ? `${gynecologyLastCheckValue} ${gynecologyLastCheckUnit}`
            : "";

        const entriesToSave = [
            { pregnancyStatus },
            pregnancyStatus === "yes" && pregnancyWeek ? { pregnancyWeek } : null,
            pregnancyStatus === "no" && formattedLastCheck ? { gynecologyLastCheck: formattedLastCheck } : null
        ].filter(Boolean);

        for (const entry of entriesToSave) {
            const exists = answers.some((a) => JSON.stringify(a) === JSON.stringify(entry));
            if (!exists) answers.push(entry);
        }

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        localStorage.setItem("selectedGynecology", JSON.stringify([pregnancyStatus]));

        console.log("📝 Answers:", JSON.stringify(answers, null, 2));

        this.submitAllPatientAnswersToAPI();
    };

    submitAllPatientAnswersToAPI = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        if (answers.length === 0) return;

        const formattedAnswers = answers.reduce((acc, obj) => {
            // Speciálně zpracuj { key: "...", value: "..." } záznamy
            if ("key" in obj && "value" in obj && Object.keys(obj).length === 2) {
                acc[obj.key] = obj.value;
            } else {
                for (const key in obj) {
                    if (Array.isArray(acc[key]) && Array.isArray(obj[key])) {
                        acc[key] = [...acc[key], ...obj[key]];
                    } else if (typeof acc[key] === "object" && typeof obj[key] === "object") {
                        acc[key] = { ...acc[key], ...obj[key] };
                    } else {
                        acc[key] = obj[key];
                    }
                }
            }
            return acc;
        }, {});
        

        console.log("📦 Formatted Answers (to be submitted):", JSON.stringify(formattedAnswers, null, 2));

        Axios.post(`/answers/info`, formattedAnswers, {
            headers: {
                Authorization: "Bearer " + this.props.loginData.token,
                "Content-Type": "application/json"
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

                <div className="pregnancy-row">
                    <h2>Is there a possibility that you are pregnant?</h2>
                    <div className="button-group">
                        <button
                            className={`gender-button ${this.state.pregnancyStatus === "yes" ? "selected" : ""}`}
                            onClick={() => this.setState({ pregnancyStatus: "yes" })}
                        >
                            Yes
                        </button>
                        <button
                            className={`gender-button ${this.state.pregnancyStatus === "no" ? "selected" : ""}`}
                            onClick={() => this.setState({ pregnancyStatus: "no" })}
                        >
                            No
                        </button>
                    </div>
                </div>

                {this.state.pregnancyStatus === "yes" && (
                    <>
                        <h2>In which week of pregnancy are you?</h2>
                        <select
                            className="week-select"
                            onChange={(e) => this.setState({ pregnancyWeek: e.target.value })}
                            value={this.state.pregnancyWeek}
                        >
                            <option value="" disabled>-- Select week --</option>
                            {Array.from({ length: 42 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </>
                )}

                {this.state.pregnancyStatus === "no" && (
                    <>
                        <h2>When was your last gynecological check?</h2>
                        <div className="last-check-group">
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 3"
                                value={this.state.gynecologyLastCheckValue}
                                onChange={(e) => this.setState({ gynecologyLastCheckValue: e.target.value })}
                                className="last-check-input"
                            />
                            <select
                                onChange={(e) => this.setState({ gynecologyLastCheckUnit: e.target.value })}
                                className="last-check-select"
                                value={this.state.gynecologyLastCheckUnit}
                            >
                                <option value="days">days</option>
                                <option value="weeks">weeks</option>
                                <option value="months">months</option>
                                <option value="years">years</option>
                            </select>
                        </div>
                    </>
                )}

                <button className="finish-button" onClick={this.handleSave}>Dokončit</button>
            </div>
        );
    }
}

const GynecologySection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: GynecologyView
};

export { GynecologySection };
