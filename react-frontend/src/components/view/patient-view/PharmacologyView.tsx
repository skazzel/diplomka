import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/pharmacology-view.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { BadHabbitsSection } from "./BadHabbits";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";

export abstract class Pharmacology<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PharmacologyView<T extends ISectionProps> extends Pharmacology<T> {
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
        this.props.dispatch(new SwitchViewAction(BadHabbitsSection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 && !this.state.selectedSymptom.trim()) {
            console.log("⚠️ No medication selected.");
            return;
        }

        this.setState((prevState) => {
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

            // ✅ Prevent duplicate entries when switching screens
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ medications: prevState.selectedSymptoms }))) {
                answers.push({ medications: prevState.selectedSymptoms });
                localStorage.setItem("patientAnswers", JSON.stringify(answers)); // ✅ Store updated answers
                console.log("📜 Updated Patient Answers:", answers);
            }

            return { selectedSymptom: "" }; // ✅ Reset selectedSymptom
        }, () => {
            this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView)); // ✅ Navigate to next section
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

                    <h2>What medication are you currently taking?</h2>
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
                        <span>Ibalgin</span>
                        <span>Heparin</span>
                        <span>Biseptol</span>
                        <span>Acylpyrin</span>
                    </div>

                    <div className="selected-symptoms-container">
                        <h3>Medications you are taking:</h3>
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
const PharmacologySection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: PharmacologyView,
};

export { PharmacologySection };
