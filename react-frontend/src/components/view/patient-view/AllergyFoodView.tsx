import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/foodAllergy.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PharmacologySection } from "./PharmacologyView";
import { AllergyMedicationSelection } from "./AllergyMedicationView";

export abstract class AllergyFood<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class AllergyFoodView<T extends ISectionProps> extends AllergyFood<T> {
    constructor(props: T) {
        super(props);

        // ✅ Load stored allergies from `localStorage`
        let storedAllergies = JSON.parse(localStorage.getItem("selectedAllergies") || "[]");

        if (!Array.isArray(storedAllergies)) {
            storedAllergies = [];
        }

        this.state = {
            selectedSymptoms: [], // ✅ Persisted list of allergies
            inputText: "",  
        };
    }

    handleBackClick = (): void => {
        console.log("Switching back to PharmacologySection...");
        this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 && !this.state.inputText.trim()) {
            console.log("⚠️ No allergies selected.");
            return;
        }

        this.setState((prevState) => {
            const newAllergy = prevState.inputText.trim();
            
            // ✅ Update allergy list only if a new allergy is provided
            const updatedSymptoms = newAllergy
                ? [...prevState.selectedSymptoms, newAllergy]
                : [...prevState.selectedSymptoms];

            // ✅ Prevent duplicate entries when switching screens
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ foodAllergies: updatedSymptoms }))) {
                answers.push({ foodAllergies: updatedSymptoms });
                localStorage.setItem("patientAnswers", JSON.stringify(answers)); // ✅ Store updated list
                console.log("📜 Updated Patient Answers:", answers);
            }

            // ✅ Save allergies into `selectedAllergies`
            localStorage.setItem("selectedAllergies", JSON.stringify(updatedSymptoms)); // ✅ Save to storage

            console.log("📜 Updated Allergy List:", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms, inputText: "" }; // ✅ Reset input field
        }, () => {
            this.props.dispatch(new SwitchViewAction(AllergyMedicationSelection.defaultView)); // ✅ Navigate forward
        });
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove);

            localStorage.setItem("selectedAllergies", JSON.stringify(updatedSymptoms)); // ✅ Update storage
            console.log("🗑️ Allergy removed:", symptomToRemove);
            console.log("📜 Updated Allergy List (After Removal):", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms };
        });
    };

    handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ inputText: event.target.value });
    };

    addSymptom = (): void => {
        const { inputText, selectedSymptoms } = this.state;
        if (inputText.trim() !== "") {
            this.setState({
                selectedSymptoms: [...selectedSymptoms, inputText.trim()],
                inputText: "", // ✅ Clear input after adding
            });
        }
    };

    render(): ReactNode {
        return (
            <div className="food-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="food-container">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What food are you allergic to?</h2>
                    <div className="input-container">
                        <input
                            type="text"
                            value={this.state.inputText}
                            onChange={this.handleInputChange}
                            placeholder="Type food allergy..."
                        />
                        <button className="search-button" onClick={this.addSymptom}>Add</button>
                    </div>

                    <div className="selected-symptoms-container">
                        <h3>Selected Allergies:</h3>
                        <ul className="selected-symptoms-list">
                            {this.state.selectedSymptoms.map((symptom, index) => (
                                <li key={index}>
                                    • {symptom}
                                    <span className="delete-symptom" onClick={() => this.removeSymptom(symptom)}>
                                        🗑️ delete
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button className="next-button" onClick={this.saveSymptomAndProceed}>Next</button>
                </div>
            </div>
        );
    }
}

/** ✅ Updated Section Export */
const AllergyFoodSelection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: AllergyFoodView,
};

export { AllergyFoodSelection };
