import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/pain.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { MainConditionSection } from "./ConditionView";
import { HPatientSection } from "./HPatientView";
import { MainSymptomSection } from "./MainSymptom";
import emoji1 from "../../../img/color-emoji-clean-1.png";
import emoji3 from "../../../img/color-emoji-clean-2.png";
import emoji5 from "../../../img/color-emoji-clean-3.png";
import emoji7 from "../../../img/color-emoji-clean-4.png";
import birdImg from "../../../img/bird.png";
import emoji10 from "../../../img/color-emoji-clean-5.png";
import { getTranslation as t, getCzechLabel as cz } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";

export abstract class PainChoice<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PainChoiceView<T extends ISectionProps> extends PainChoice<T> {
    constructor(props: T) {
        super(props);
        const saved = JSON.parse(localStorage.getItem("painChoice") || "{}");
        this.state = {
            painType: saved.painType || "",
            painChange: saved.painChange || "",
            painWorse: saved.painWorse || "",
            painRelief: saved.painRelief || "",
            painIntensity: saved.painIntensity || 1,
            painTime: saved.painTime || "",
            painkillerEffect: saved.painkillerEffect || "",
            tookPainkillers: saved.tookPainkillers || "",
            progress: getProgress("painView", "default"),
        };
    }

    componentDidUpdate(): void {
        this.saveCurrentPainToLocalStorage();
    }

    saveCurrentPainToLocalStorage = (): void => {
        const state = this.state;
        localStorage.setItem("painChoice", JSON.stringify(state));
    };

    handleBackClick = (): void => {
        this.savePainToAnswers();
        this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
    };

    savePainToAnswers = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const painKeys = ["painType", "painChange", "painWorse", "painRelief", "painIntensity", "painTime", "tookPainkillers", "painkillerEffect"];
        answers = answers.filter(entry => !painKeys.some(key => key in entry));
        const entries = Object.entries(this.state).filter(([key, val]) => val !== "");
        for (const [key, val] of entries) {
            answers.push({ [key]: val });
        }
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
    };

    savePainAndProceed = (): void => {
        this.savePainToAnswers();
        const symptoms: string[] = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]");
        const symptomTypes = JSON.parse(localStorage.getItem("symptomTypes") || "{}");

        let nextView;
        if (symptoms.length > 1) {
            nextView = MainSymptomSection.defaultView;
        } else if (symptoms.length === 1) {
            const isPain = symptomTypes[symptoms[0]] === "bolest";
            nextView = isPain ? MainConditionSection.defaultView : HPatientSection.defaultView;
        } else {
            nextView = HPatientSection.defaultView;
        }
        this.props.dispatch(new SwitchViewAction(nextView));
    };

    render(): ReactNode {
        const emojiMap: { [key: number]: string } = { 1: emoji1, 3: emoji3, 5: emoji5, 7: emoji7, 10: emoji10 };
        const painTypeOptions = ["sharp", "dull", "burning", "throbbing", "cramping", "radiating", "pressing"];
        const painChangeOptions = ["worse", "better", "same"];
        const painTimeOptions = ["night", "morning", "afternoon", "after_meal", "activity", "temperature", "constant"];
        const painWorseOptions = ["movement", "rest", "food", "heat", "cold", "sitting", "stress", "nothing"];
        const painReliefOptions = ["painkillers", "rest", "warm", "cold", "position", "food", "nothing"];
        const yesNoOptions = ["yes", "no"];
        const painkillerEffectOptions = ["better", "same", "worse"];

        return (
            <div className="patient-view">
                <div className="container" id="symptom-input">
                    <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
                    <div className="progress-container">
                        <div className="progress-bar-wrapper">
                            <div className="progress-bar">
                                <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                                <div className="progress active"></div>
                                <div className="progress pending"></div>
                            </div>
                            <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                        </div>
                        <span className="progress-label">{t("progress_basic_info")}</span>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">{t("pain_type_label")}</label>
                        <select className="dropdown-select" value={this.state.painType} onChange={(e) => this.setState({ painType: e.target.value })}>
                            <option value="">{t("dropdown_select_placeholder")}</option>
                            {painTypeOptions.map(opt => <option key={opt} value={cz("pain_type", opt)}>{t(`pain_type_${opt}`)}</option>)}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">{t("pain_change_label")}</label>
                        <select className="dropdown-select" value={this.state.painChange} onChange={(e) => this.setState({ painChange: e.target.value })}>
                            <option value="">{t("dropdown_select_placeholder")}</option>
                            {painChangeOptions.map(opt => <option key={opt} value={cz("pain_change", opt)}>{t(`pain_change_${opt}`)}</option>)}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">{t("pain_time_label")}</label>
                        <select className="dropdown-select" value={this.state.painTime} onChange={(e) => this.setState({ painTime: e.target.value })}>
                            <option value="">{t("dropdown_select_placeholder")}</option>
                            {painTimeOptions.map(opt => <option key={opt} value={cz("pain_time", opt)}>{t(`pain_time_${opt}`)}</option>)}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">{t("pain_worse_label")}</label>
                        <select className="dropdown-select" value={this.state.painWorse} onChange={(e) => this.setState({ painWorse: e.target.value })}>
                            <option value="">{t("dropdown_select_placeholder")}</option>
                            {painWorseOptions.map(opt => <option key={opt} value={cz("pain_worse", opt)}>{t(`pain_worse_${opt}`)}</option>)}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">{t("pain_relief_label")}</label>
                        <select className="dropdown-select" value={this.state.painRelief} onChange={(e) => this.setState({ painRelief: e.target.value })}>
                            <option value="">{t("dropdown_select_placeholder")}</option>
                            {painReliefOptions.map(opt => <option key={opt} value={cz("pain_relief", opt)}>{t(`pain_relief_${opt}`)}</option>)}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">{t("took_painkillers_label")}</label>
                        <select className="dropdown-select" value={this.state.tookPainkillers} onChange={(e) => this.setState({ tookPainkillers: e.target.value })}>
                            <option value="">{t("dropdown_select_placeholder")}</option>
                            {yesNoOptions.map(opt => <option key={opt} value={cz("option", opt)}>{t(`option_${opt}`)}</option>)}
                        </select>
                    </div>

                    {this.state.tookPainkillers === cz("option", "yes") && (
                        <div className="dropdown-row">
                            <label className="dropdown-label">{t("painkiller_effect_label")}</label>
                            <select className="dropdown-select" value={this.state.painkillerEffect} onChange={(e) => this.setState({ painkillerEffect: e.target.value })}>
                                <option value="">{t("dropdown_select_placeholder")}</option>
                                {painkillerEffectOptions.map(opt => <option key={opt} value={cz("painkiller_effect", opt)}>{t(`painkiller_effect_${opt}`)}</option>)}
                            </select>
                        </div>
                    )}

                    <h2>{t("pain_intensity_label")}</h2>
                    <div className="pain-scale-wrapper">
                        <div className="pain-emojis">
                            {[10, 7, 5, 3, 1].map(level => (
                                <img key={level} src={emojiMap[level]} alt={`Pain level ${level}`} className="pain-emoji" />
                            ))}
                        </div>
                        <div className="pain-buttons">
                            {[...Array(10)].map((_, index) => {
                                const level = index + 1;
                                return (
                                    <button
                                        key={level}
                                        className={`pain-button ${this.state.painIntensity === level ? "selected" : ""}`}
                                        onClick={() => this.setState({ painIntensity: level })}
                                    >
                                        {level}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="button-next" onClick={this.savePainAndProceed}>{t("button_next")}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const PainCheckSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: PainChoiceView,
};

export { PainCheckSection };
