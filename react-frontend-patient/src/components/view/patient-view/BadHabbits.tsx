import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/BadHabbits.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { SurgeryTypeSection } from "./operationView";
import { DrugsSection } from "./DrugsView";

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
            smokingSince: storedHabits.smokingSince || ""
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
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ badHabits: prevState.selectedHabits }))) {
                answers.push({ badHabits: prevState.selectedHabits });
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
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                    </div>

                    <h2>Do you drink alcohol?</h2>
                    <div className="habbits-group">
                        <label><input type="radio" name="alcohol" value="yes" checked={this.state.selectedHabits.alcohol === "yes"} onChange={() => this.handleHabitSelection("alcohol", "yes")} /> Yes</label>
                        <label><input type="radio" name="alcohol" value="no" checked={this.state.selectedHabits.alcohol === "no"} onChange={() => this.handleHabitSelection("alcohol", "no")} /> No</label>
                    </div>

                    {this.state.showAlcoholAmount && (
                        <div className="alcohol-types">
                            <h2>If yes, how much per week?</h2>
                            <div className="alcohol-item"><img src="/img/whiskey.png" className="icon" alt="hard" /><input type="number" placeholder="Shots of hard liquor" value={this.state.selectedHabits.alcoholHard || ""} onChange={(e) => this.handleAlcoholInput("alcoholHard", e.target.value)} /></div>
                            <div className="alcohol-item"><img src="/img/wine-glass.png" className="icon" alt="wine" /><input type="number" placeholder="Glasses of wine" value={this.state.selectedHabits.alcoholWine || ""} onChange={(e) => this.handleAlcoholInput("alcoholWine", e.target.value)} /></div>
                            <div className="alcohol-item"><img src="/img/beer.png" className="icon" alt="beer" /><input type="number" placeholder="Beers" value={this.state.selectedHabits.alcoholBeer || ""} onChange={(e) => this.handleAlcoholInput("alcoholBeer", e.target.value)} /></div>
                        </div>
                    )}

                    <h2>Do you smoke cigarettes?</h2>
                    <div className="habbits-group">
                        <label><input type="radio" name="smoking" value="yes" checked={this.state.selectedHabits.smoking === "yes"} onChange={() => this.handleHabitSelection("smoking", "yes")} /> Yes</label>
                        <label><input type="radio" name="smoking" value="no" checked={this.state.selectedHabits.smoking === "no"} onChange={() => this.handleHabitSelection("smoking", "no")} /> No</label>
                    </div>

                    {this.state.showSmokingAmount && (
                        <>
                            <div id="smoking-amount">
                                <h2>If yes, how much?</h2>
                                <input type="number" className="input-field" placeholder="Number of cigarettes per day" value={this.state.selectedHabits.smokingAmount || ""} onChange={(e) => this.handleAmountInput("smoking", e.target.value)} />
                            </div>
                            <div className="smoking-detail-row">
                                <label className="smoking-label">Since when do you smoke?</label>
                                <input type="text" className="smoking-since-input" placeholder="e.g. 2015" value={this.state.smokingSince} onChange={(e) => this.handleSinceInput(e.target.value)} />
                            </div>
                        </>
                    )}

                    <button className="button-next" onClick={this.saveHabitAndProceed}>Next</button>
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
