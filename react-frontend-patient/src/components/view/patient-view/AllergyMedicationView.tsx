import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { HButton, HButtonStyle } from "../../HButton";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { GynecologySection } from "./GynecologyView";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { SocialSelection } from "./SocialView";

export abstract class AllergyMedication<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class AllergyMedicationView<T extends ISectionProps> extends AllergyMedication<T> {
    constructor(props: T) {
        super(props);

        const stored = JSON.parse(localStorage.getItem("selectedMedicationAllergies") || "[]");

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: stored,
            selectedSymptom: "",
            searchString: "",
            searchKey: 0,
            errorText: "",
            userSearch: []
        };

        console.log("📜 Initial Medication List:", this.state.selectedSymptoms);
    }

    componentDidUpdate(): void {
        localStorage.setItem("selectedMedicationAllergies", JSON.stringify(this.state.selectedSymptoms));
    }

    handleBackClick = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers = answers.filter((entry: any) => 
            !entry.hasOwnProperty("foodAllergies") && 
            !entry.hasOwnProperty("allergySymptoms")
        );
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("🗑️ Removed 'foodAllergies' and 'allergySymptoms' entries from patientAnswers:", answers);

        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 && !this.state.selectedSymptom.trim()) {
            console.log("⚠️ No medication allergy selected.");
            return;
        }

        this.setState((prevState) => {
            const newMedication = prevState.selectedSymptom.trim();

            const updatedSymptoms = newMedication
                ? [...prevState.selectedSymptoms, newMedication]
                : [...prevState.selectedSymptoms];

            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ medication_allergy: updatedSymptoms }))) {
                answers.push({ medication_allergy: updatedSymptoms });
                localStorage.setItem("patientAnswers", JSON.stringify(answers));
                console.log("📜 Updated Patient Answers:", answers);
            }

            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms));
            console.log("📜 Updated Medication Allergy List:", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms, selectedSymptom: "" };
        }, () => {
            this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
        });
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove);

            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms));
            console.log("🗑️ Medication removed:", symptomToRemove);
            console.log("📜 Updated Medication List (After Removal):", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms };
        });
    };

    saveNoneAndProceed = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers.push({ medication_allergy: ["None"] });
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
    };

    handleSelectSymptom = (medication: string) => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.includes(medication)) {
                console.log("⚠️ Medication already added.");
                return prevState;
            }

            const updatedSymptoms = [...prevState.selectedSymptoms, medication];

            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms));
            console.log("📜 Updated Medication List:", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms };
        });
    };

    performSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const mecication = e.target.value.trim();

        if (typeof this.state.searchTimeout !== "undefined") {
            clearTimeout(this.state.searchTimeout);
        }

        this.setState(() => ({
            errorText: "",
            searchString: mecication
        }));

        if (mecication === "") {
            this.setState(() => ({
                userSearch: []
            }));
            return;
        }

        const timeout = window.setTimeout(() => {
            Axios.get("/medications/info", {
                params: { medication: mecication + "%" },
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

                    <h2>What medication are you allergic to?</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input
                                key={this.state.searchKey}
                                type="text"
                                value={this.state.searchString || ""}
                                onChange={this.performSearch}
                                placeholder="Enter medication name..."
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
                                        {this.state.userSearch?.map((result) => (
                                            <tr className="hs-userbox-result" key={result.medication_id}>
                                                <td className="hs-userbox-result-name">
                                                    {result.medicine}
                                                </td>
                                                <td className="hs-userbox-controls">
                                                    <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => { this.handleSelectSymptom(result.medicine); }} >
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

                    <div className="selected-symptoms-container">
                        <h3>Medications you are allergic to:</h3>
                        <div className="scrollable-selected-symptoms">
                            <ul className="selected-symptoms-list">
                                {this.state.selectedSymptoms.map((mecication) => (
                                    <li key={mecication}>
                                        • {mecication}
                                        <span className="delete-symptom" onClick={() => this.removeSymptom(mecication)}>
                                            🗑️ delete
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="buttons-row">
                        <button className="button-next" onClick={this.saveSymptomAndProceed}>Next</button>
                        <button className="button-skip" onClick={this.saveNoneAndProceed}>None</button>
                    </div>
                </div>
            </div>
        );
    }
}

const AllergyMedicationSelection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: AllergyMedicationView,
};

export { AllergyMedicationSelection };
