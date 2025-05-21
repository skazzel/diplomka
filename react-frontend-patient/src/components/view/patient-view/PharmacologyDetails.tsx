import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
//import "../../../style/medication-details.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { MainSymptomSection } from "./MainSymptom";
import { AllergyFoodSelection } from "./AllergyFoodView";

export abstract class MedicationDetails<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MedicationDetailsView<T extends ISectionProps> extends MedicationDetails<T> {
    constructor(props: T) {
        super(props);
        const medications = JSON.parse(localStorage.getItem("selectedMedications") || "[]");

        const storedDetails = JSON.parse(localStorage.getItem("medicationDetails") || "{}");

        this.state = {
            medicationData: medications.map((name: string) => ({
                name,
                sinceMonth: storedDetails[name]?.sinceMonth || "",
                sinceYear: storedDetails[name]?.sinceYear || "",
                morning: storedDetails[name]?.morning || "",
                noon: storedDetails[name]?.noon || "",
                night: storedDetails[name]?.night || ""
            }))
        };
    }

    componentDidUpdate(): void {
        const detailMap: Record<string, any> = {};
        this.state.medicationData.forEach(m => {
            detailMap[m.name] = {
                sinceMonth: m.sinceMonth,
                sinceYear: m.sinceYear,
                morning: m.morning,
                noon: m.noon,
                night: m.night
            };
        });
        localStorage.setItem("medicationDetails", JSON.stringify(detailMap));
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("medications"));
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
        this.props.dispatch(new SwitchViewAction(require("./PharmacologyView").PharmacologySection.defaultView));
    };

    handleInputChange = (index: number, field: string, value: string) => {
        const updated = [...this.state.medicationData];
        updated[index][field] = value;
        this.setState({ medicationData: updated });
    };

    handleSave = () => {
        const filled = this.state.medicationData
            .filter(m => m.sinceMonth || m.sinceYear || m.morning || m.noon || m.night)
            .map(m => ({
                medication: m.name,
                since: m.sinceMonth && m.sinceYear ? `${m.sinceMonth} ${m.sinceYear}` : undefined,
                frequency: `${m.morning || 0}-${m.noon || 0}-${m.night || 0}`
            }));

        if (filled.length > 0) {
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            const existingIndex = answers.findIndex((entry: any) => entry.hasOwnProperty("medicationDetails"));
            if (existingIndex !== -1) {
                answers[existingIndex] = { medicationDetails: filled };
            } else {
                answers.push({ medicationDetails: filled });
            }
            localStorage.setItem("patientAnswers", JSON.stringify(answers));
        }

        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
    };

    render(): ReactNode {
        const months = [
            "", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 1899 }, (_, i) => (1900 + i).toString());

        return (
            <div className="medication-details-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>

                <h2>Additional Information about Your Medications</h2>

                {this.state.medicationData.map((med, idx) => (
                    <div key={idx} className="medication-block">
                        <h3>{med.name}</h3>

                        <div className="row">
                            <label>Since when?</label>
                            <select value={med.sinceMonth} onChange={(e) => this.handleInputChange(idx, "sinceMonth", e.target.value)}>
                                {months.map((m, i) => (
                                    <option key={i} value={m}>{m}</option>
                                ))}
                            </select>
                            <select value={med.sinceYear} onChange={(e) => this.handleInputChange(idx, "sinceYear", e.target.value)}>
                                <option value="">Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="row">
                            <label>How often? <span style={{ fontSize: "12px", color: "#666" }}>(Morning - Noon - Night)</span></label>
                            <div className="frequency-inputs">
                                <input
                                    type="number"
                                    placeholder="Morning"
                                    value={med.morning}
                                    onChange={(e) => this.handleInputChange(idx, "morning", e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Noon"
                                    value={med.noon}
                                    onChange={(e) => this.handleInputChange(idx, "noon", e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Night"
                                    value={med.night}
                                    onChange={(e) => this.handleInputChange(idx, "night", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button className="button" onClick={this.handleSave}>Next</button>
            </div>
        );
    }
}

const MedicationDetailsSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MedicationDetailsView,
};

export { MedicationDetailsSection };
