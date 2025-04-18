import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/MedicationAllergy.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PharmacologySection } from "./PharmacologyView";
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

        // ✅ Load stored medications from `localStorage`
        let storedMedications = JSON.parse(localStorage.getItem("selectedMedications") || "[]");

        if (!Array.isArray(storedMedications)) {
            storedMedications = [];
        }

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
            selectedSymptom: "",
        };

        console.log("📜 Initial Medication List:", this.state.selectedSymptoms);
    }

    handleBackClick = (): void => {
        console.log("Navigating to BadHabbitsSection...");
        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 && !this.state.selectedSymptom.trim()) {
            console.log("⚠️ No medication allergy selected.");
            return;
        }

        this.setState((prevState) => {
            const newMedication = prevState.selectedSymptom.trim();

            // ✅ Update medication list only if a new medication is provided
            const updatedSymptoms = newMedication
                ? [...prevState.selectedSymptoms, newMedication]
                : [...prevState.selectedSymptoms];

            // ✅ Prevent duplicate entries when switching screens
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ medication_allergy: updatedSymptoms }))) {
                answers.push({ medication_allergy: updatedSymptoms });
                localStorage.setItem("patientAnswers", JSON.stringify(answers)); // ✅ Store updated list
                console.log("📜 Updated Patient Answers:", answers);
            }

            // ✅ Save medication allergies into `selectedMedicationAllergies`
            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms)); // ✅ Save to storage

            console.log("📜 Updated Medication Allergy List:", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms, selectedSymptom: "" }; // ✅ Reset selectedSymptom
        }, () => {
            this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView)); // ✅ Navigate forward
        });
    };
    

    removeSymptom = (symptomToRemove: string): void => {
        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove);

            localStorage.setItem("selectedMedications", JSON.stringify(updatedSymptoms)); // ✅ Update localStorage
            console.log("🗑️ Medication removed:", symptomToRemove);
            console.log("📜 Updated Medication List (After Removal):", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms };
        });
    };

    handleSelectSymptom = (medication: string) => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.includes(medication)) {
                console.log("⚠️ Medication already added.");
                return prevState;
            }
    
            const updatedSymptoms = [...prevState.selectedSymptoms, medication];
    
            localStorage.setItem("selectedMedications", JSON.stringify(updatedSymptoms)); // ✅ Save to localStorage
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
            console.log("Value:", mecication);

            Axios.get("/medications/info", {
                params: {
                    medication: mecication + "%",
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
        return (
            <div className="pharma-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="pharma-container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What medication are you allergic to?</h2>
                    <VBox className="scrollable-search-container"> {/* ✅ Added Scrollable Wrapper */}
                        <HBox>
                            <input 
                                key={this.state.searchKey} 
                                type="text"
                                value={this.state.searchString} 
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
                                        {this.state.userSearch?.map(result => (
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

                    <div className="tags">
                        <span>None</span>
                        <span>Heparin</span>
                        <span>Biseptol</span>
                        <span>Acylpyrin</span>
                    </div>

                    <div className="selected-symptoms-container">
                        <h3>Medications you are allergic to:</h3>
                        <div className="scrollable-selected-symptoms">
                            <ul className="selected-symptoms-list">
                                {this.state.selectedSymptoms.map((mecication, index) => (
                                    <li key={index}>
                                        • {mecication}  
                                        <span className="delete-symptom" onClick={() => this.removeSymptom(mecication)}>
                                            🗑️ delete
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button className="button" onClick={this.saveSymptomAndProceed}>Next</button>
                    </div>
                </div>
            </div>
        );
    }
}

/** ✅ Updated Section Export */
const AllergyMedicationSelection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: AllergyMedicationView,
};

export { AllergyMedicationSelection };
