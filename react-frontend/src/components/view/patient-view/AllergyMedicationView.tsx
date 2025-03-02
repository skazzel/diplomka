import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/MedicationAllergy.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PharmacologySection } from "./PharmacologyView";
import { HButton, HButtonStyle } from "../../HButton";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { GynecologySection } from "./GynecologyView";

export abstract class AllergyMedication<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class AllergyMedicationView<T extends ISectionProps> extends AllergyMedication<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            selectedSymptoms: [],
            inputText: "",  // ✅ Store user input here
        };
    }

    handleBackClick = (): void => {
        console.log("Switching back to PharmacologySection...");
        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
    };

    handleNextClick = (): void => {
        console.log("Switching to AllergyMedicationSelection...");
        localStorage.setItem("selectedSymptoms", JSON.stringify(this.state.selectedSymptoms));
        this.props.dispatch(new SwitchViewAction(GynecologySection.defaultView));
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState(prevState => ({
            selectedSymptoms: prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove)
        }));
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
            <div className="medication-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="medication-container">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What medications are you allergic to?</h2>
                    <div className="input-container">
                        <input
                            type="text"
                            value={this.state.inputText}
                            onChange={this.handleInputChange}
                            placeholder="Type mdication allergy..."
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

                    <button className="next-button" onClick={this.handleNextClick}>Next</button>
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
