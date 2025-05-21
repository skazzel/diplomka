import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/pharmacology-view.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { BadHabbitsSection } from "./BadHabbits";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";
import { MedicationDetailsSection } from "./PharmacologyDetails";

export abstract class Pharmacology<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PharmacologyView<T extends ISectionProps> extends Pharmacology<T> {
    constructor(props: T) {
        super(props);

        let storedMedications = JSON.parse(localStorage.getItem("selectedMedications") || "[]");
        if (!Array.isArray(storedMedications)) storedMedications = [];

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: storedMedications,
            selectedSymptom: "",
            searchString: "",
            searchKey: 0,
            errorText: "",
            userSearch: []
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("selectedMedications", JSON.stringify(this.state.selectedSymptoms));
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("drugs"));
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
        this.props.dispatch(new SwitchViewAction(require("./DrugsView").DrugsSection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 && !this.state.selectedSymptom.trim()) {
            console.log("⚠️ No medication selected.");
            return;
        }

        this.setState((prevState) => {
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ medications: prevState.selectedSymptoms }))) {
                answers.push({ medications: prevState.selectedSymptoms });
                localStorage.setItem("patientAnswers", JSON.stringify(answers));
            }
            return { selectedSymptom: "" };
        }, () => {
            this.props.dispatch(new SwitchViewAction(MedicationDetailsSection.defaultView));
        });
    };

    handleNoneAndProceed = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers.push({ medications: ["None"] });
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove);
            return { selectedSymptoms: updatedSymptoms };
        });
    };

    handleSelectSymptom = (medication: string) => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.includes(medication)) return prevState;
            const updatedSymptoms = [...prevState.selectedSymptoms, medication];
            return { selectedSymptoms: updatedSymptoms };
        });
    };

    performSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const mecication = e.target.value.trim();
        if (typeof this.state.searchTimeout !== "undefined") clearTimeout(this.state.searchTimeout);

        this.setState(() => ({
            errorText: "",
            searchString: mecication
        }));

        if (mecication === "") {
            this.setState(() => ({ userSearch: [] }));
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
                    this.setState(() => ({ userSearch: response.data }));
                } else {
                    this.setState(() => ({ errorText: "Unexpected API response format." }));
                }
            }).catch(() => {
                this.setState(() => ({ errorText: "Došlo k chybě při vyhledávání, prosím zkuste to znovu později." }));
            });
        }, 350);

        this.setState({ searchTimeout: timeout });
    }

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

                        <h2>What medication are you currently taking?</h2>
                        <VBox className="scrollable-search-container">
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
                                            {this.state.userSearch?.map((result, index) => (
                                                <tr className="hs-userbox-result" key={`${result.medication_id || result.medicine}-${index}`}>
                                                    <td className="hs-userbox-result-name">
                                                        {result.medicine}
                                                    </td>
                                                    <td className="hs-userbox-controls">
                                                        <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => { this.handleSelectSymptom(result.medicine); }}>
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
                            <h3>Medications you are taking:</h3>
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
                            <button className="button-skip" onClick={this.handleNoneAndProceed}>I take no medications</button>
                        </div>
                    </div>
                </div>
        );
    }
}

const PharmacologySection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: PharmacologyView,
};

export { PharmacologySection };
