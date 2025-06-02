import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode, ChangeEvent } from "react";
import "../../../style/condition.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { ChronicalSection } from "./ChronicalView";
import { MainSymptomSection } from "./MainSymptom";
import birdImg from "../../../img/bird.png";
import { PainCheckSection } from "./PainView";
import { getTranslation as t, getCzechLabel as cz } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";

export abstract class MainCondition<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainConditionView<T extends ISectionProps> extends MainCondition<T> {
    constructor(props: T) {
        super(props);
        const storedCondition = localStorage.getItem("selectedCondition") || "";
        const storedPreviousTrouble = localStorage.getItem("previousTrouble") || "";
        const storedNumber = localStorage.getItem("durationNumber") || "";
        const storedUnit = localStorage.getItem("durationUnit") || "";

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: [],
            selectedCondition: storedCondition,
            selectedNumber: storedNumber,
            selectedUnit: storedUnit,
            previousTrouble: storedPreviousTrouble,
            searchString: "",
            searchTimeout: undefined,
            userSearch: [],
            errorText: "",
            progress: getProgress("conditionView", "default"),
        };
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const allSymptoms = answers
            .filter(entry => Array.isArray(entry.symptoms))
            .flatMap(entry => entry.symptoms);

        const selectedSymptoms = [...new Set(allSymptoms)];
        const symptomTypes = JSON.parse(localStorage.getItem("symptomTypes") || "{}");

        const hasPain = selectedSymptoms.some(sym => symptomTypes[sym] === "bolest");

        // Smazání odpovědí týkajících se bolesti
        const filteredAnswers = answers.filter((entry: any) =>
            !entry.hasOwnProperty("painType") &&
            !entry.hasOwnProperty("painChange") &&
            !entry.hasOwnProperty("painWorse") &&
            !entry.hasOwnProperty("painRelief") &&
            !entry.hasOwnProperty("painIntensity") &&
            !entry.hasOwnProperty("painTime")
        );
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));

        console.log("FULL ANSWERS", answers);

        if (selectedSymptoms.length > 1) {
            this.props.dispatch(new SwitchViewAction(MainSymptomSection.defaultView));
        } else if (selectedSymptoms.length === 1 && hasPain) {
            this.props.dispatch(new SwitchViewAction(PainCheckSection.defaultView));
        } else if (selectedSymptoms.length === 1 && !hasPain) {
            this.props.dispatch(new SwitchViewAction(require("../patient-view/HPatientView").HPatientSection.defaultView));
        } else {
            this.props.dispatch(new SwitchViewAction(MainSymptomSection.defaultView));
        }
    };

    handleSelect = (field: string, value: string) => {
        this.setState({ [field]: value });
        localStorage.setItem(field, value);
    };

    saveSymptomAndProceed = (): void => {
        const numberValue = this.selectedNumber?.value;
        const unitValue = this.selectedUnit?.value;
        const { selectedCondition, previousTrouble } = this.state;

        if (!numberValue || !unitValue || unitValue === "---" || selectedCondition === "---" || previousTrouble === "---") {
            console.log("Missing values in form.");
            return;
        }

        localStorage.setItem("durationNumber", numberValue);
        localStorage.setItem("durationUnit", unitValue);

        const fullDuration = `${numberValue} ${cz("duration", unitValue)}`;

        this.setState((prevState) => {
            let answers: any[] = [];
            try {
                const stored = localStorage.getItem("patientAnswers");
                answers = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(answers)) {
                    answers = [];
                }
            } catch (e) {
                answers = [];
            }

            const entriesToSave = [
                { condition: cz("condition", selectedCondition) },
                { previousTrouble: cz("condition_previous", previousTrouble) },
                { duration: fullDuration }
            ];

            for (const entry of entriesToSave) {
                const isDuplicate = answers.some(existing => JSON.stringify(existing) === JSON.stringify(entry));
                if (!isDuplicate) {
                    answers.push(entry);
                }
            }

            localStorage.setItem("patientAnswers", JSON.stringify(answers));
            return {
                selectedSymptom: null,
                selectedNumber: numberValue,
                selectedUnit: unitValue,
                selectedDate: fullDuration
            };
        }, () => {
            this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
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

                    <div className="symptom-row">
                        <label className="symptom-label">{t("condition_change_label")}</label>
                        <select className="symptom-select" value={this.state.selectedCondition} onChange={(e) => this.handleSelect("selectedCondition", e.target.value)}>
                            <option value="">---</option>
                            <option value="better">{t("condition_better")}</option>
                            <option value="worse">{t("condition_worse")}</option>
                            <option value="same">{t("condition_same")}</option>
                        </select>
                    </div>

                    <div className="symptom-row">
                        <label className="symptom-label">{t("condition_duration_label")}</label>
                        <div className="duration-input-group">
                            <select className="symptom-select" ref={(ref) => (this.selectedNumber = ref)} defaultValue={this.state.selectedNumber} onChange={(e) => localStorage.setItem("durationNumber", e.target.value)}>
                                <option value="">---</option>
                                {[...Array(31)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                            <select className="symptom-select" ref={(ref) => (this.selectedUnit = ref)} defaultValue={this.state.selectedUnit} onChange={(e) => localStorage.setItem("durationUnit", e.target.value)}>
                                <option value="">---</option>
                                <option value="hours">{t("duration_unit_hours")}</option>
                                <option value="days">{t("duration_unit_days")}</option>
                                <option value="weeks">{t("duration_unit_weeks")}</option>
                                <option value="years">{t("duration_unit_years")}</option>
                            </select>
                        </div>
                    </div>

                    <div className="symptom-row">
                        <label className="symptom-label">{t("condition_repeat_label")}</label>
                        <select className="symptom-select" value={this.state.previousTrouble} onChange={(e) => this.handleSelect("previousTrouble", e.target.value)}>
                            <option value="">---</option>
                            <option value="yes_repeat">{t("condition_previous_yes_repeat")}</option>
                            <option value="yes_once">{t("condition_previous_yes_once")}</option>
                            <option value="no">{t("condition_previous_no")}</option>
                            <option value="dont_know">{t("condition_previous_dont_know")}</option>
                        </select>
                    </div>

                    <div>
                        <button className="button-next" onClick={this.saveSymptomAndProceed}>{t("button_next")}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const MainConditionSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MainConditionView,
};

export { MainConditionSection };
