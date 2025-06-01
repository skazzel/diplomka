import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { HButton, HButtonStyle } from "../../HButton";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { GynecologySection } from "./GynecologyView";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { SocialSelection } from "./SocialView";
import birdImg from "../../../img/bird.png";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";

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
            userSearch: [],
            progress: getProgress("aleergyMedicationView", "default")
        };

        console.log("\ud83d\udcdc Initial Medication List:", this.state.selectedSymptoms);
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
        console.log("\ud83d\udd91\ufe0f Removed 'foodAllergies' and 'allergySymptoms' entries from patientAnswers:", answers);

        this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 && !this.state.selectedSymptom.trim()) {
            console.log("\u26a0\ufe0f No medication allergy selected.");
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
                console.log("\ud83d\udcdc Updated Patient Answers:", answers);
            }

            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms));
            console.log("\ud83d\udcdc Updated Medication Allergy List:", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms, selectedSymptom: "" };
        }, () => {
            this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
        });
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove);

            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms));
            console.log("\ud83d\udd91\ufe0f Medication removed:", symptomToRemove);
            console.log("\ud83d\udcdc Updated Medication List (After Removal):", updatedSymptoms);

            return { selectedSymptoms: updatedSymptoms };
        });
    };

    saveNoneAndProceed = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers.push({ medication_allergy: [t("Neguje")] });
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
    };

    handleSelectSymptom = (medication: string) => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.includes(medication)) {
                console.log("\u26a0\ufe0f Medication already added.");
                return prevState;
            }

            const updatedSymptoms = [...prevState.selectedSymptoms, medication];

            localStorage.setItem("selectedMedicationAllergies", JSON.stringify(updatedSymptoms));
            console.log("\ud83d\udcdc Updated Medication List:", updatedSymptoms);

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
                const results = Array.isArray(response.data) ? response.data : [];
                this.setState({
                    userSearch: results,
                    errorText: results.length === 0 ? t("error_symptom_search") : ""
                });
            }).catch(() => {
                this.setState(() => ({
                    errorText: t("error_symptom_search")
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
                    <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
                    <div className="progress-container">
                        <div className="progress-bar-wrapper">
                            <div className="progress-bar">
                                <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                            </div>
                            <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                        </div>
                        <span className="progress-label">{t("progress_basic_info")}</span>
                    </div>

                    <h2>{t("medication_allergy_question")}</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input
                                key={this.state.searchKey}
                                type="text"
                                value={this.state.searchString || ""}
                                onChange={this.performSearch}
                                placeholder={t("pharmacology_search_placeholder")}
                            />
                        </HBox>

                        {this.state.errorText && this.state.userSearch.length === 0 && (
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
                                                        {t("select")}
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
                        <h3>{t("medication_allergy_selected_heading")}</h3>
                        <div className="scrollable-selected-symptoms">
                            <ul className="selected-symptoms-list">
                                {this.state.selectedSymptoms.map((mecication) => (
                                    <li key={mecication}>
                                        • {mecication}
                                        <span className="delete-symptom" onClick={() => this.removeSymptom(mecication)}>
                                            🗑️ {t("delete")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="buttons-row">
                        <button className="button-next" onClick={this.saveSymptomAndProceed}>{t("button_next")}</button>
                        <button className="button-skip" onClick={this.saveNoneAndProceed}>{t("button_no_allergy")}</button>
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
