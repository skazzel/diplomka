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
import emoji10 from "../../../img/color-emoji-clean-5.png";

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
            tookPainkillers: saved.tookPainkillers || ""
        };
    }

    componentDidUpdate(): void {
        this.saveCurrentPainToLocalStorage();
    }

    saveCurrentPainToLocalStorage = (): void => {
        const {
            painType, painChange, painWorse, painRelief,
            painIntensity, painTime, painkillerEffect, tookPainkillers
        } = this.state;

        localStorage.setItem("painChoice", JSON.stringify({
            painType, painChange, painWorse, painRelief,
            painIntensity, painTime, painkillerEffect, tookPainkillers
        }));
    };

    handleBackClick = (): void => {
        this.savePainToAnswers();
        this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
    };

    savePainToAnswers = (): void => {
        const {
            painType, painChange, painWorse, painRelief,
            painIntensity, painTime, painkillerEffect, tookPainkillers
        } = this.state;

        const entriesToSave = [
            { painType },
            { painChange },
            { painWorse },
            { painRelief },
            { painIntensity },
            { painTime },
            { tookPainkillers }
        ];

        if (tookPainkillers === "Ano" && painkillerEffect) {
            entriesToSave.push({ painkillerEffect });
        }

        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        for (const entry of entriesToSave) {
            const isDuplicate = answers.some(existing => JSON.stringify(existing) === JSON.stringify(entry));
            if (!isDuplicate) {
                answers.push(entry);
            }
        }

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
    };

    savePainAndProceed = (): void => {
        this.savePainToAnswers();
        //localStorage.removeItem("painChoice");

        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const symptomsEntry = answers.find((entry: any) => entry.symptoms);
        const symptoms = symptomsEntry ? symptomsEntry.symptoms : [];

        if (symptoms.length > 1) {
            this.props.dispatch(new SwitchViewAction(MainSymptomSection.defaultView));
        } else {
            this.props.dispatch(new SwitchViewAction(MainConditionSection.defaultView));
        }
    };

    render(): ReactNode {
        const emojiMap: { [key: number]: string } = {
            1: emoji1,
            3: emoji3,
            5: emoji5,
            7: emoji7,
            10: emoji10
        };

        return (
            <div className="patient-view">
                <div className="container" id="symptom-input">
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>

                    <div className="dropdown-row">
                        <label className="dropdown-label">Typ bolesti:</label>
                        <select className="dropdown-select" value={this.state.painType} onChange={(e) => this.setState({ painType: e.target.value })}>
                            <option value="">-- Vyberte --</option>
                            {["Ostrá", "Tupá", "Pálivá", "Pulsující", "Křečová", "Vystřelující", "Tlaková"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">Bolest se:</label>
                        <select className="dropdown-select" value={this.state.painChange} onChange={(e) => this.setState({ painChange: e.target.value })}>
                            <option value="">-- Vyberte --</option>
                            {["Zhoršuje", "Zlepšuje", "Je stejná"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">Kdy se bolest zhoršuje:</label>
                        <select className="dropdown-select" value={this.state.painTime} onChange={(e) => this.setState({ painTime: e.target.value })}>
                            <option value="">-- Vyberte --</option>
                            {["Ano, zhoršují se v noci", "Ano, zhoršují se ráno", "Ano, zhoršují se odpoledne", "Ano, zhoršují se po jídle", "Ano, zhoršují se při fyzické aktivitě", "Ano, zhoršují se při chladu/teple", "Ne, příznaky jsou stejné celý den"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">Co bolest zhoršuje:</label>
                        <select className="dropdown-select" value={this.state.painWorse} onChange={(e) => this.setState({ painWorse: e.target.value })}>
                            <option value="">-- Vyberte --</option>
                            {["Pohyb", "Odpočinek", "Jídlo / pití", "Teplo", "Chlad", "Sezení / stání", "Stres"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">Co bolest zlepšuje:</label>
                        <select className="dropdown-select" value={this.state.painRelief} onChange={(e) => this.setState({ painRelief: e.target.value })}>
                            <option value="">-- Vyberte --</option>
                            {["Léky proti bolesti", "Odpočinek", "Teplý obklad", "Studený obklad", "Změna polohy", "Jídlo / pití", "Nic nepomáhá"].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="dropdown-row">
                        <label className="dropdown-label">Užil(a) jste léky proti bolesti?</label>
                        <select className="dropdown-select" value={this.state.tookPainkillers} onChange={(e) => this.setState({ tookPainkillers: e.target.value })}>
                            <option value="">-- Vyberte --</option>
                            <option value="Ano">Ano</option>
                            <option value="Ne">Ne</option>
                        </select>
                    </div>

                    {this.state.tookPainkillers === "Ano" && (
                        <div className="dropdown-row">
                            <label className="dropdown-label">Měly léky účinek?</label>
                            <select className="dropdown-select" value={this.state.painkillerEffect} onChange={(e) => this.setState({ painkillerEffect: e.target.value })}>
                                <option value="">-- Vyberte --</option>
                                <option value="Zlepšení">Zlepšení</option>
                                <option value="Stejné">Stejné</option>
                                <option value="Zhoršení">Zhoršení</option>
                            </select>
                        </div>
                    )}

                    <h2>Jak velká je bolest?</h2>
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
                        <button className="button-next" onClick={this.savePainAndProceed}>Pokračovat</button>
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
