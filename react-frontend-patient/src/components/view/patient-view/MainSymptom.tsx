import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/MainSymptom.less";
import { HPatientSection } from "./HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";
import { ChronicalSection } from "./ChronicalView";
import { MainConditionSection } from "./ConditionView";
import { PainCheckSection } from "./PainView";
import { getTranslation as t, getCzechLabel as cz } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";
import birdImg from "../../../img/bird.png";

export abstract class MainSymptom<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainSymptomView<T extends ISectionProps> extends MainSymptom<T> {
    constructor(props: T) {
        super(props);

        const storedSymptoms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]");
        const validSymptoms = Array.isArray(storedSymptoms) ? storedSymptoms.filter((symptom) => typeof symptom === "string" && symptom.trim() !== "") : [];

        const selectedSymptom = localStorage.getItem("selectedMainSymptom") || "";

        this.state = {
            showErrorMessage: false,
            selectedSymptoms: validSymptoms,
            selectedSymptom: selectedSymptom,
            progress: getProgress("mainSymptom", "default")
        };

        console.log("📜 Initial Symptom List:", validSymptoms);
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const symptomTypes = JSON.parse(localStorage.getItem("symptomTypes") || "{}");

        const selectedSymptoms: string[] = answers
            .filter((entry: any) => Array.isArray(entry.symptoms))
            .flatMap((entry: any) => entry.symptoms);
    
        const hasPain = selectedSymptoms.some(sym => symptomTypes[sym] === "bolest");

        const filteredAnswers = answers.filter((entry: any) =>
            !entry.hasOwnProperty("painType") &&
            !entry.hasOwnProperty("painChange") &&
            !entry.hasOwnProperty("painWorse") &&
            !entry.hasOwnProperty("painRelief") &&
            !entry.hasOwnProperty("painIntensity") &&
            !entry.hasOwnProperty("painTime")
        );
    
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
    
        if (hasPain) {
            this.props.dispatch(new SwitchViewAction(PainCheckSection.defaultView));
        } else {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        }
    };
    
    handleSymptomSelection = (symptom: string) => {
        this.setState({ selectedSymptom: symptom });
        localStorage.setItem("selectedMainSymptom", symptom);
    };

    saveSymptomAndProceed = (): void => {
        if (!this.state.selectedSymptom) return;
    
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
        // Načti mapu z localStorage: český název → ID
        const labelToIdMap = JSON.parse(localStorage.getItem("symptomLabelToIdMap") || "{}");
    
        // Najdi ID pro vybraný český název symptomu
        const selectedLabel = this.state.selectedSymptom;
        const mainSymptomId = labelToIdMap[selectedLabel] || selectedLabel;
    
        // Pokud záznam ještě neexistuje, ulož ho
        if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ main_symptom: mainSymptomId }))) {
            answers.push({ main_symptom: mainSymptomId });
            localStorage.setItem("patientAnswers", JSON.stringify(answers));
        }
    
        this.props.dispatch(new SwitchViewAction(MainConditionSection.defaultView));
    };
    

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
                    <div className="progress-bar-wrapper">
                        <div className="progress-bar">
                            <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                        </div>
                        <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                    </div>

                    <h2>{t("main_symptom_question")}</h2>

                    <div className="symptom-list">
                        {this.state.selectedSymptoms.map((symptom, index) => (
                            <label key={index} className="symptom-option">
                                <input
                                    type="radio"
                                    name="symptom"
                                    value={symptom || ""}
                                    checked={this.state.selectedSymptom === symptom}
                                    onChange={() => this.handleSymptomSelection(symptom)}
                                />
                                <span className="symptom-label">{cz(symptom, symptom)}</span>
                            </label>
                        ))}
                    </div>

                    <button className="button-next" onClick={this.saveSymptomAndProceed}>{t("button_next")}</button>
                </div>
            </div>
        );
    }
}

const MainSymptomSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MainSymptomView,
};

export { MainSymptomSection };
