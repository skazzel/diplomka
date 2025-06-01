import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/drugs.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { MainSymptomSection } from "./MainSymptom";
import { PharmacologySection } from "./PharmacologyView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class Drugs<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class DrugsView<T extends ISectionProps> extends Drugs<T> {
    constructor(props: T) {
        super(props);
        const stored = JSON.parse(localStorage.getItem("drugsData") || "{}");
        this.state = {
            status: stored.status || "",
            drugName: stored.drugName || "",
            durationValue: stored.durationValue || "",
            durationUnit: stored.durationUnit || "months",
            quitDurationValue: stored.quitDurationValue || "",
            quitDurationUnit: stored.quitDurationUnit || "months",
            quitDate: stored.quitDate || "",
            progress: getProgress("drugView", "default")
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("drugsData", JSON.stringify(this.state));
    }

    handleOptionSelect = (option: string) => {
        this.setState({ status: option });
    };

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("badHabits"));
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
        this.props.dispatch(new SwitchViewAction(require("./BadHabbits").BadHabbitsSection.defaultView));
    };

    handleNext = () => {
        const { status, drugName, durationValue, durationUnit, quitDurationValue, quitDurationUnit, quitDate } = this.state;
    
        if (!status) return;
    
        const cz = (key: string, value: string): string => {
            const map: Record<string, string> = {
                yes: "Ano",
                no: "Ne",
                quit: "Přestal jsem",
                days: "dní",
                weeks: "týdnů",
                months: "měsíců",
                years: "let"
            };
            return map[value] || value;
        };
    
        const translatedStatus = cz("status", status);
        const translatedDurationUnit = cz("unit", status === "yes" ? durationUnit : quitDurationUnit);
        const howLong = `${status === "yes" ? durationValue : quitDurationValue} ${translatedDurationUnit}`;
    
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
        const entry = {
            drugs: {
                status: translatedStatus,
                ...(status === "yes" && {
                    drugName,
                    howLong
                }),
                ...(status === "quit" && {
                    drugName,
                    howLong,
                    quitDate
                })
            }
        };
    
        const existingIndex = answers.findIndex((a: any) => a.hasOwnProperty("drugs"));
        if (existingIndex !== -1) {
            answers[existingIndex] = entry;
        } else {
            answers.push(entry);
        }
    
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("📦 Saved drug answers (translated):", answers);
    
        this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView));
    };

    render(): ReactNode {
        const { status, durationUnit, quitDurationUnit } = this.state;

        const unitOptions = ["days", "weeks", "months", "years"];

        return (
            <div className="patient-view">
                <div className="container">
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

                    <h2>{t("drugs_question")}</h2>
                    <div className="button-group">
                        {[
                            { key: "yes", label: t("option_yes") },
                            { key: "no", label: t("option_no") },
                            { key: "quit", label: t("option_quit") }
                        ].map(option => (
                            <button
                                key={option.key}
                                className={`answer-button ${this.state.status === option.key ? "selected" : ""}`}
                                onClick={() => this.handleOptionSelect(option.key)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {(status === "yes" || status === "quit") && (
                        <>
                            <h3>{t("drugs_name_question")} <span className="optional">({t("optional")})</span></h3>
                            <input
                                type="text"
                                placeholder={t("drugs_name_placeholder")}
                                value={this.state.drugName}
                                onChange={e => this.setState({ drugName: e.target.value })}
                            />

                            <h3>{t("drugs_duration_question")}</h3>
                            <div className="duration-group">
                                <input
                                    type="number"
                                    min="0"
                                    value={status === "yes" ? this.state.durationValue : this.state.quitDurationValue}
                                    onChange={e =>
                                        this.setState({
                                            [status === "yes" ? "durationValue" : "quitDurationValue"]: e.target.value
                                        })
                                    }
                                />
                                <select
                                    value={status === "yes" ? durationUnit : quitDurationUnit}
                                    onChange={e =>
                                        this.setState({
                                            [status === "yes" ? "durationUnit" : "quitDurationUnit"]: e.target.value
                                        })
                                    }
                                >
                                    {unitOptions.map(unit => (
                                        <option key={unit} value={unit}>{t("unit_" + unit)}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {status === "quit" && (
                        <>
                            <h3>{t("drugs_quit_question")}</h3>
                            <input
                                type="date"
                                value={this.state.quitDate}
                                onChange={e => this.setState({ quitDate: e.target.value })}
                            />
                        </>
                    )}

                    <div style={{ marginTop: "20px" }}>
                        <button className="button-next" onClick={this.handleNext}>{t("button_next")}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const DrugsSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: DrugsView,
};

export { DrugsSection };
