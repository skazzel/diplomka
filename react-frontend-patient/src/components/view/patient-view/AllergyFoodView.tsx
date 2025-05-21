import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/foodAllergy.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PharmacologySection } from "./PharmacologyView";
import { AllergyMedicationSelection } from "./AllergyMedicationView";
import { HBox, VBox } from "../../HCard";
import { EnumRole } from "../../../data/UserData";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";
import { MedicationDetailsSection } from "./PharmacologyDetails";

export abstract class AllergyFood<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class AllergyFoodView<T extends ISectionProps> extends AllergyFood<T> {
    constructor(props: T) {
        super(props);

        const stored = JSON.parse(localStorage.getItem("allergyFood") || "{}");

        this.state = {
            selectedAllergies: stored.selectedAllergies || [],
            inputText: "",
            symptomSearch: "",
            userSearch: [],
            selectedSymptoms: stored.selectedSymptoms || [],
            noAllergies: stored.noAllergies || false
        };
    }

    componentDidUpdate(): void {
        const { selectedAllergies, selectedSymptoms, noAllergies } = this.state;
        localStorage.setItem("allergyFood", JSON.stringify({ selectedAllergies, selectedSymptoms, noAllergies }));
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("medicationDetails"));
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));

        const medicationsEntry = answers.find((entry: any) => entry.medications);
        if (medicationsEntry?.medications?.[0] === "None") {
            this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView));
        } else {
            this.props.dispatch(new SwitchViewAction(MedicationDetailsSection.defaultView));
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ inputText: e.target.value });
    };

    handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.trim();
        this.setState({ symptomSearch: keyword });

        if (keyword === "") {
            this.setState({ userSearch: [] });
            return;
        }

        Axios.get("/allergy_symptom/info", {
            params: {
                symptom: keyword + "%",
                role: this.props.searchRole === EnumRole.PATIENT
            },
            method: "GET",
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        }).then((response) => {
            if (Array.isArray(response.data)) {
                this.setState({ userSearch: response.data });
            }
        }).catch(() => {
            console.error("❌ Error fetching allergy symptoms");
        });
    };

    addAllergy = () => {
        if (!this.state.inputText.trim()) return;
        this.setState((prev) => ({
            selectedAllergies: [...prev.selectedAllergies, prev.inputText.trim()],
            inputText: ""
        }));
    };

    addSymptom = (symptom: string) => {
        this.setState((prev) => ({
            selectedSymptoms: [...prev.selectedSymptoms, symptom],
            symptomSearch: "",
            userSearch: []
        }));
    };

    removeItem = (item: string, key: "selectedAllergies" | "selectedSymptoms") => {
        this.setState((prev) => ({
            [key]: prev[key].filter((i: string) => i !== item)
        }));
    };

    handleNoAllergy = () => {
        this.setState({
            noAllergies: true,
            selectedAllergies: [],
            selectedSymptoms: []
        }, this.saveAndProceed);
    };

    saveAndProceed = () => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        const foodEntry = this.state.noAllergies ? { foodAllergies: ["None"] } : { foodAllergies: this.state.selectedAllergies };
        const symptomsEntry = this.state.noAllergies ? { allergySymptoms: ["None"] } : { allergySymptoms: this.state.selectedSymptoms };

        [foodEntry, symptomsEntry].forEach(entry => {
            const exists = answers.some(a => JSON.stringify(a) === JSON.stringify(entry));
            if (!exists) answers.push(entry);
        });

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        this.props.dispatch(new SwitchViewAction(AllergyMedicationSelection.defaultView));
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

                    <h2>What food are you allergic to?</h2>
                    <div className="input-container">
                        <input
                            type="text"
                            value={this.state.inputText}
                            onChange={this.handleInputChange}
                            placeholder="Type food allergy..."
                        />
                        <button className="button-add" onClick={this.addAllergy}>Add</button>
                    </div>

                    <h2>How does your allergy manifest?</h2>
                    <VBox>
                        <HBox>
                            <input
                                type="text"
                                value={this.state.symptomSearch}
                                onChange={this.handleSearchChange}
                                placeholder="Search symptom..."
                            />
                        </HBox>
                        {this.state.userSearch.length > 0 && (
                            <div className="scrollable-results">
                                <table className="hs-userbox-table">
                                    <tbody>
                                        {this.state.userSearch.map((s) => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td>
                                                    <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => this.addSymptom(s.name)}>Vybrat</HButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </VBox>

                    <div className="selected-symptoms-container">
                        <h3>Selected Allergies:</h3>
                        <ul>
                            {this.state.selectedAllergies.map((a, i) => (
                                <li key={i}>• {a} <span onClick={() => this.removeItem(a, "selectedAllergies")}>🗑️</span></li>
                            ))}
                        </ul>

                        <h3>Selected Allergy Symptoms:</h3>
                        <ul>
                            {this.state.selectedSymptoms.map((s, i) => (
                                <li key={i}>• {s} <span onClick={() => this.removeItem(s, "selectedSymptoms")}>🗑️</span></li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="buttons-row">
                        <button className="button-next" onClick={this.saveAndProceed}>Next</button>
                        <button onClick={this.handleNoAllergy} className="button-skip">None</button>
                    </div>
                </div>
            </div>
        );
    }
}

const AllergyFoodSelection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: AllergyFoodView,
};

export { AllergyFoodSelection };
