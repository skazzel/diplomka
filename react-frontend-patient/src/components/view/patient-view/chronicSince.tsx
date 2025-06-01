import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { ChronicalSection } from "./ChronicalView";
import { SurgeryTypeSection } from "./operationView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";
import birdImg from "../../../img/bird.png";

export abstract class ChronicalSince<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class ChronicalSinceView<T extends ISectionProps> extends ChronicalSince<T> {
    constructor(props: T) {
        super(props);
        const selected = (() => {
            const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            const chronic = answers.find((entry: any) => entry.hasOwnProperty("chronicCondition"));
            return chronic?.chronicCondition || [];
        })();

        const state: Record<string, { month: string; year: string }> = {};
        selected.forEach((disease: string) => {
            const stored = JSON.parse(localStorage.getItem("chronicalSince") || "[]");
            const found = stored.find((entry: any) => entry.disease === disease);
            state[disease] = {
                month: found?.since.split(" ")[0] || "",
                year: found?.since.split(" ")[1] || ""
            };
        });

        this.state = {
            selectedDiseases: selected,
            diseaseDates: state,
            progress: getProgress("chronicalSince", "default")
        };
    }

    handleMonthChange = (disease: string, month: string) => {
        this.setState((prev) => {
            const updated = {
                ...prev.diseaseDates,
                [disease]: { ...prev.diseaseDates[disease], month }
            };
            localStorage.setItem("chronicalSince", JSON.stringify(this.mapDatesToArray(updated)));
            return { diseaseDates: updated };
        });
    };

    handleYearChange = (disease: string, year: string) => {
        this.setState((prev) => {
            const updated = {
                ...prev.diseaseDates,
                [disease]: { ...prev.diseaseDates[disease], year }
            };
            localStorage.setItem("chronicalSince", JSON.stringify(this.mapDatesToArray(updated)));
            return { diseaseDates: updated };
        });
    };

    mapDatesToArray = (diseaseDates: Record<string, { month: string; year: string }>) => {
        return Object.entries(diseaseDates).map(([disease, val]) => ({
            disease,
            since: `${val.month} ${val.year}`.trim()
        }));
    };

    handleNext = (): void => {
        const dataToSave = this.mapDatesToArray(this.state.diseaseDates);
    
        // ✅ VALIDACE: žádný záznam nemá zadaný měsíc ani rok
        const hasValidEntry = dataToSave.some(entry => entry.since.trim() !== "");
        if (!hasValidEntry) {
            return;
        }
    
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const existingIndex = answers.findIndex((entry: any) => entry.hasOwnProperty("chronicalSince"));
        if (existingIndex !== -1) {
            answers[existingIndex] = { chronicalSince: dataToSave };
        } else {
            answers.push({ chronicalSince: dataToSave });
        }
    
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        localStorage.setItem("chronicalSince", JSON.stringify(dataToSave));
    
        console.log("📦 Updated patientAnswers:", answers);
    
        this.props.dispatch(new SwitchViewAction(SurgeryTypeSection.defaultView));
    };
    
    handleBackClick = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers = answers.filter((entry: any) => !entry.chronicCondition);
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("🧹 Removed chronicCondition from answers:", answers);

        this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
    };

    render(): ReactNode {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);

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
                    <h2>{t("chronic_since_question")}</h2>

                    <ul className="selected-symptoms-list">
                        {this.state.selectedDiseases.map((disease: string, i: number) => (
                            <li key={i} className="symptom-row">
                                <div className="symptom-label">{disease}</div>
                                <div className="date-selection">
                                    <select
                                        className="symptom-select"
                                        value={this.state.diseaseDates[disease].month}
                                        onChange={(e) => this.handleMonthChange(disease, e.target.value)}
                                    >
                                        <option value="">---</option>
                                        {months.map((m) => (
                                            <option key={m} value={m}>{t(`month_${m.toLowerCase()}`)}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="symptom-select"
                                        value={this.state.diseaseDates[disease].year}
                                        onChange={(e) => this.handleYearChange(disease, e.target.value)}
                                    >
                                        <option value="">---</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <button className="button-next" onClick={this.handleNext}>{t("button_next")}</button>
                </div>
            </div>
        );
    }
}

const ChronicalSinceSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: ChronicalSinceView,
};

export { ChronicalSinceSection };
