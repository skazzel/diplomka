import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/BadHabbits.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { ChronicalSection } from "./ChronicalView";
import { PharmacologySection } from "./PharmacologyView";

export abstract class BadHabbits<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class BadHabbitsView<T extends ISectionProps> extends BadHabbits<T> {
    constructor(props: T) {
        super(props);

        // ✅ Load stored habits from `localStorage`
        const storedHabits = JSON.parse(localStorage.getItem("badHabits") || "{}");

        this.state = {
            selectedHabits: {},
        };
    }

    handleBackClick = (): void => {
        console.log("🔙 Navigating to ChronicalSection...");
        this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
    };

    saveHabitAndProceed = (): void => {
        if (Object.keys(this.state.selectedHabits).length === 0) {
            console.log("⚠️ No habits selected.");
            return;
        }

        this.setState((prevState) => {
            let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

            // ✅ Prevent duplicate entries when switching screens
            if (!answers.some(entry => JSON.stringify(entry) === JSON.stringify({ badHabits: prevState.selectedHabits }))) {
                answers.push({ badHabits: prevState.selectedHabits });
                localStorage.setItem("patientAnswers", JSON.stringify(answers)); // ✅ Store updated answers
                console.log("📜 Updated Patient Answers:", answers);
            }

            return {};
        }, () => {
            this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView)); // ✅ Navigate forward
        });
    };

    handleHabitSelection = (habit: string, value: string): void => {
        this.setState((prevState) => {
            const updatedHabits = { ...prevState.selectedHabits, [habit]: value };

            if (habit === "alcohol") updatedHabits.alcoholAmount = value === "yes" ? prevState.selectedHabits.alcoholAmount || "" : "";
            if (habit === "smoking") updatedHabits.smokingAmount = value === "yes" ? prevState.selectedHabits.smokingAmount || "" : "";

            localStorage.setItem("badHabits", JSON.stringify(updatedHabits)); // ✅ Save habits
            console.log("📜 Updated Bad Habits:", updatedHabits);

            return {
                selectedHabits: updatedHabits,
                showAlcoholAmount: habit === "alcohol" ? value === "yes" : prevState.showAlcoholAmount,
                showSmokingAmount: habit === "smoking" ? value === "yes" : prevState.showSmokingAmount,
            };
        });
    };

    handleAmountInput = (habit: string, amount: string): void => {
        this.setState((prevState) => {
            const updatedHabits = { ...prevState.selectedHabits, [`${habit}Amount`]: amount };

            localStorage.setItem("badHabits", JSON.stringify(updatedHabits)); // ✅ Save habits
            console.log("📜 Updated Habit Amount:", updatedHabits);

            return {
                selectedHabits: updatedHabits,
            };
        });
    };

    render(): ReactNode {
        return (
            <div className="Habbit-view">
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>Do you drink alcohol?</h2>
                    <div className="habbits-group">
                        <label>
                            <input
                                type="radio"
                                name="alcohol"
                                value="yes"
                                checked={this.state.selectedHabits.alcohol === "yes"}
                                onChange={() => this.handleHabitSelection("alcohol", "yes")}
                            /> Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="alcohol"
                                value="no"
                                checked={this.state.selectedHabits.alcohol === "no"}
                                onChange={() => this.handleHabitSelection("alcohol", "no")}
                            /> No
                        </label>
                    </div>

                    {this.state.showAlcoholAmount && (
                        <div id="alcohol-amount">
                            <h2>If yes, how much?</h2>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Number of drinks per day"
                                value={this.state.selectedHabits.alcoholAmount || ""}
                                onChange={(e) => this.handleAmountInput("alcohol", e.target.value)}
                            />
                        </div>
                    )}

                    <h2>Do you smoke cigarettes?</h2>
                    <div className="habbits-group">
                        <label>
                            <input
                                type="radio"
                                name="smoking"
                                value="yes"
                                checked={this.state.selectedHabits.smoking === "yes"}
                                onChange={() => this.handleHabitSelection("smoking", "yes")}
                            /> Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="smoking"
                                value="no"
                                checked={this.state.selectedHabits.smoking === "no"}
                                onChange={() => this.handleHabitSelection("smoking", "no")}
                            /> No
                        </label>
                    </div>

                    {this.state.showSmokingAmount && (
                        <div id="smoking-amount">
                            <h2>If yes, how much?</h2>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Number of cigarettes per day"
                                value={this.state.selectedHabits.smokingAmount || ""}
                                onChange={(e) => this.handleAmountInput("smoking", e.target.value)}
                            />
                        </div>
                    )}

                    <button className="next-button" onClick={this.saveHabitAndProceed}>Next</button>
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
