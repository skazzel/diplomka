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
import { getTranslation as t } from "../../../data/QuestionTranslation";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

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
            userSearch: [],
            progress: getProgress("pharmacologyView", "default")
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
        answers.push({ medications: [t("pharmacology_none")] });
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
        const medication = e.target.value.trim();
        if (typeof this.state.searchTimeout !== "undefined") clearTimeout(this.state.searchTimeout);
    
        this.setState({
            errorText: "",
            searchString: medication
        });
    
        if (medication === "") {
            this.setState({ userSearch: [] });
            return;
        }
    
        const timeout = window.setTimeout(() => {
            Axios.get("/medications/info", {
                params: { medication: medication + "%" },
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
                this.setState({
                    userSearch: [],
                    errorText: t("error_symptom_search")
                });
            });
        }, 350);
    
        this.setState({ searchTimeout: timeout });
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

                    <h2>{t("pharmacology_question")}</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input
                                key={this.state.searchKey}
                                type="text"
                                value={this.state.searchString}
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
                                        {this.state.userSearch?.map((result, index) => (
                                            <tr className="hs-userbox-result" key={`${result.medication_id || result.medicine}-${index}`}>
                                                <td className="hs-userbox-result-name">
                                                    {result.medicine}
                                                </td>
                                                <td className="hs-userbox-controls">
                                                    <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => { this.handleSelectSymptom(result.medicine); }}>
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
                        <h3>{t("pharmacology_selected_heading")}</h3>
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
                        <button className="button-skip" onClick={this.handleNoneAndProceed}>{t("pharmacology_none")}</button>
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
