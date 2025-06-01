import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/BadHabbits.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { SurgeryTypeSection } from "./operationView";
import { DrugsSection } from "./DrugsView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import hard_alcohol from "../../../img/hard-alcohol.png";
import beer from "../../../img/beer.png";
import vine from "../../../img/vine.png";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class BadHabbits<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class BadHabbitsView<T extends ISectionProps> extends BadHabbits<T> {
    constructor(props: T) {
        super(props);

        const storedHabits = JSON.parse(localStorage.getItem("badHabits") || "{}");

        this.state = {
            selectedHabits: storedHabits,
            showAlcoholAmount: storedHabits.alcohol === "yes",
            showSmokingAmount: storedHabits.smoking === "yes",
            smokingSince: storedHabits.smokingSince || "",
            progress: getProgress("badHabbits", "default")
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("badHabits", JSON.stringify(this.state.selectedHabits));
    }

    handleBackClick = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers = answers.filter((entry: any) => !entry.hasOwnProperty("surgeries"));
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        this.props.dispatch(new SwitchViewAction(SurgeryTypeSection.defaultView));
    };

    saveHabitAndProceed = (): void => {
        if (Object.keys(this.state.selectedHabits).length === 0) return;
    
        this.setState((prevState) => {
            const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
            // Překlad hodnot pomocí překladového souboru
            const cz = (key: string, value: string): string => {
                const map = {
                    yes: "Ano",
                    no: "Ne"
                    // můžeš sem doplnit další překlady
                };
                return map[value] || value;
            };
    
            const translatedHabits: Record<string, string> = {};
            for (const [key, value] of Object.entries(prevState.selectedHabits)) {
                translatedHabits[key] = cz(key, String(value));
            }
    
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ badHabits: translatedHabits }))) {
                answers.push({ badHabits: translatedHabits });
                localStorage.setItem("patientAnswers", JSON.stringify(answers));
            }
    
            return {};
        }, () => {
            this.props.dispatch(new SwitchViewAction(DrugsSection.defaultView));
        });
    };
    

    handleHabitSelection = (habit: string, value: string): void => {
        this.setState((prevState) => {
            const updatedHabits = { ...prevState.selectedHabits, [habit]: value };

            if (habit === "alcohol" && value !== "yes") {
                delete updatedHabits.alcoholHard;
                delete updatedHabits.alcoholWine;
                delete updatedHabits.alcoholBeer;
            }

            if (habit === "smoking" && value !== "yes") {
                delete updatedHabits.smokingAmount;
                delete updatedHabits.smokingSince;
            }

            return {
                selectedHabits: updatedHabits,
                showAlcoholAmount: habit === "alcohol" ? value === "yes" : prevState.showAlcoholAmount,
                showSmokingAmount: habit === "smoking" ? value === "yes" : prevState.showSmokingAmount,
                smokingSince: habit === "smoking" && value === "yes" ? prevState.smokingSince : ""
            };
        });
    };

    handleAlcoholInput = (type: string, amount: string): void => {
        this.setState((prevState) => {
            const updatedHabits = { ...prevState.selectedHabits, [type]: amount };
            return { selectedHabits: updatedHabits };
        });
    };

    handleAmountInput = (habit: string, amount: string): void => {
        this.setState((prevState) => {
            const updatedHabits = { ...prevState.selectedHabits, [`${habit}Amount`]: amount };
            return { selectedHabits: updatedHabits };
        });
    };

    handleSinceInput = (value: string): void => {
        this.setState((prevState) => {
            const updatedHabits = { ...prevState.selectedHabits, smokingSince: value };
            return {
                selectedHabits: updatedHabits,
                smokingSince: value
            };
        });
    };

    render(): ReactNode {
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

                    <h2>{t("alcohol_question")}</h2>
                    <div className="habbits-group">
                        <label><input type="radio" name="alcohol" value="yes" checked={this.state.selectedHabits.alcohol === "yes"} onChange={() => this.handleHabitSelection("alcohol", "yes")} /> {t("option_yes")}</label>
                        <label><input type="radio" name="alcohol" value="no" checked={this.state.selectedHabits.alcohol === "no"} onChange={() => this.handleHabitSelection("alcohol", "no")} /> {t("option_no")}</label>
                    </div>

                    {this.state.showAlcoholAmount && (
                        <div className="alcohol-types">
                            <h2>{t("alcohol_amount_question")}</h2>
                            <div className="alcohol-item"><img src={hard_alcohol} className="icon" alt="hard" /><input type="number" placeholder={t("alcohol_hard_placeholder")} value={this.state.selectedHabits.alcoholHard || ""} onChange={(e) => this.handleAlcoholInput("alcoholHard", e.target.value)} /></div>
                            <div className="alcohol-item"><img src={vine} className="icon" alt="wine" /><input type="number" placeholder={t("alcohol_wine_placeholder")} value={this.state.selectedHabits.alcoholWine || ""} onChange={(e) => this.handleAlcoholInput("alcoholWine", e.target.value)} /></div>
                            <div className="alcohol-item"><img src={beer} className="icon" alt="beer" /><input type="number" placeholder={t("alcohol_beer_placeholder")} value={this.state.selectedHabits.alcoholBeer || ""} onChange={(e) => this.handleAlcoholInput("alcoholBeer", e.target.value)} /></div>
                        </div>
                    )}

                    <h2>{t("smoking_question")}</h2>
                    <div className="habbits-group">
                        <label><input type="radio" name="smoking" value="yes" checked={this.state.selectedHabits.smoking === "yes"} onChange={() => this.handleHabitSelection("smoking", "yes")} /> {t("option_yes")}</label>
                        <label><input type="radio" name="smoking" value="no" checked={this.state.selectedHabits.smoking === "no"} onChange={() => this.handleHabitSelection("smoking", "no")} /> {t("option_no")}</label>
                    </div>

                    {this.state.showSmokingAmount && (
                        <>
                            <div id="smoking-amount">
                                <h2>{t("smoking_amount_question")}</h2>
                                <input type="number" className="input-field" placeholder={t("smoking_amount_placeholder")} value={this.state.selectedHabits.smokingAmount || ""} onChange={(e) => this.handleAmountInput("smoking", e.target.value)} />
                            </div>
                            <div className="smoking-detail-row">
                                <label className="smoking-label">{t("smoking_since_question")}</label>
                                <input type="text" className="smoking-since-input" placeholder={t("smoking_since_placeholder")} value={this.state.smokingSince} onChange={(e) => this.handleSinceInput(e.target.value)} />
                            </div>
                        </>
                    )}

                    <button className="button-next" onClick={this.saveHabitAndProceed}>{t("button_next")}</button>
                </div>
            </div>
        );
    }
}

const BadHabbitsSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: BadHabbitsView,
};

export { BadHabbitsSection };
