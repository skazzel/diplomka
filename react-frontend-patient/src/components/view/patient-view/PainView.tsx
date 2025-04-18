import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/pain.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { MainConditionSection } from "./ConditionView";
import { HPatientSection } from "./HPatientView";

export abstract class PainChoice<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PainChoiceView<T extends ISectionProps> extends PainChoice<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            painType: "",
            painChange: "",
            painWorse: "",
            painRelief: "",
            painIntensity: 1,
            painTime: "",
            painTrigger: ""
        };
    }

    handleBackClick = (): void => {
        this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
    };

    saveSymptomAndProceed = (): void => {
        const {
            painType,
            painChange,
            painWorse,
            painRelief,
            painIntensity,
            painTime,
            painTrigger
        } = this.state;

        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        const entriesToSave = [
            { painType },
            { painChange },
            { painWorse },
            { painRelief },
            { painIntensity: parseInt(painIntensity) },
            { painTime },
            { painTrigger }
        ];

        for (const entry of entriesToSave) {
            const isDuplicate = answers.some(existing => JSON.stringify(existing) === JSON.stringify(entry));
            if (!isDuplicate) {
                answers.push(entry);
            }
        }

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("📦 Updated patientAnswers:", answers);

        this.props.dispatch(new SwitchViewAction(MainConditionSection.defaultView));
    };

    render(): ReactNode {
        const singleOptions = [
            "Ostrá", "Tupá", "Pálivá", "Pulsující", "Křečová", "Vystřelující", "Tlaková"
        ];

        const changeOptions = ["Zhoršuje", "Zlepšuje", "Je stejná"];

        const timeOptions = [
            "Ano, zhoršují se v noci",
            "Ano, zhoršují se ráno",
            "Ano, zhoršují se odpoledne",
            "Ano, zhoršují se po jídle",
            "Ano, zhoršují se při fyzické aktivitě",
            "Ano, zhoršují se při chladu/teple",
            "Ne, příznaky jsou stejné celý den"
        ];

        const triggerOptions = [
            "Pohyb", "Odpočinek", "Jídlo / pití", "Teplo", "Chlad", "Sezení / stání", "Stres"
        ];

        const reliefOptions = [
            "Léky proti bolesti", "Odpočinek", "Teplý obklad", "Studený obklad",
            "Změna polohy", "Jídlo / pití", "Nic nepomáhá"
        ];

        return (
            <div className="pain-check-container">
                <button className="back-button" onClick={this.handleBackClick}>← Zpět</button>

                <h2>Jaký je typ bolesti?</h2>
                <div className="option-group">
                    {singleOptions.map((type) => (
                        <span
                            key={type}
                            className={`option ${this.state.painType === type ? "selected" : ""}`}
                            onClick={() => this.setState({ painType: type })}
                        >
                            {type}
                        </span>
                    ))}
                </div>

                <h2>Bolest se...</h2>
                <div className="option-group">
                    {changeOptions.map((option) => (
                        <span
                            key={option}
                            className={`option ${this.state.painChange === option ? "selected" : ""}`}
                            onClick={() => this.setState({ painChange: option })}
                        >
                            {option}
                        </span>
                    ))}
                </div>

                <h2>Kdy během dne se bolest zhoršuje?</h2>
                <div className="option-group">
                    {timeOptions.map((option) => (
                        <span
                            key={option}
                            className={`option ${this.state.painTime === option ? "selected" : ""}`}
                            onClick={() => this.setState({ painTime: option })}
                        >
                            {option}
                        </span>
                    ))}
                </div>

                <h2>Co bolest zhoršuje?</h2>
                <div className="option-group">
                    {triggerOptions.map((option) => (
                        <span
                            key={option}
                            className={`option ${this.state.painWorse === option ? "selected" : ""}`}
                            onClick={() => this.setState({ painWorse: option })}
                        >
                            {option}
                        </span>
                    ))}
                </div>

                <h2>Co bolest zlepšuje?</h2>
                <div className="option-group">
                    {reliefOptions.map((option) => (
                        <span
                            key={option}
                            className={`option ${this.state.painRelief === option ? "selected" : ""}`}
                            onClick={() => this.setState({ painRelief: option })}
                        >
                            {option}
                        </span>
                    ))}
                </div>

                <h2>Jak velká je bolest? <small>(1 = žádná, 10 = nesnesitelná)</small></h2>
                <div className="pain-intensity-container">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        className="pain-slider"
                        value={this.state.painIntensity}
                        onChange={(e) => this.setState({ painIntensity: e.target.value })}
                    />
                    <div className="scale-labels">
                        <span>1</span>
                        <span>10</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <button className="button" onClick={this.saveSymptomAndProceed}>Pokračovat</button>
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
