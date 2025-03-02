import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode, useState } from "react";
import "../../../style/BadHabbits.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import Axios from "axios";
import { EnumRole } from "../../../data/UserData";
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
        this.state = {
            showAlcoholAmount: false,
            showSmokingAmount: false,
        };
    }

    handleNextClick = (): void => {
        console.log("Navigating to PersonalInfoSection...");
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleBackClick = (): void => {
        console.log("Navigating to ChronicalSection...");
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    toggleInput = (field: "showAlcoholAmount" | "showSmokingAmount", value: string): void => {
        this.setState({ [field]: value === "yes" });
    };

    handleBadHabitsSelect = (habit: string, amount: string): void => {
        console.log(`Selected habit: ${habit}, Amount: ${amount}`);

        const uid = this.props.loginData?.id ? this.props.loginData.id : "@self";

        Axios.post(`/users/${uid}/patient-info-create`, null, {
            params: { habit: habit, amount: amount },
            headers: {
                Authorization: "Bearer " + this.props.loginData.token,
            },
        })
            .then((response) => {
                console.log("✅ Habit Data Saved:", response.data);
            })
            .catch((error) => {
                console.error("❌ Error saving habit data:", error);
            });
    };

    render(): ReactNode {
        return (
            <div className="Habbit-view">
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>
                    ← Back
                    </button>
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
                                onChange={() => this.toggleInput("showAlcoholAmount", "yes")}
                            />{" "}
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="alcohol"
                                value="no"
                                onChange={() => this.toggleInput("showAlcoholAmount", "no")}
                            />{" "}
                            No
                        </label>
                    </div>

                    {this.state.showAlcoholAmount && (
                        <div id="alcohol-amount">
                            <h2>If yes, how much?</h2>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Pocet sklenit denne"
                                onBlur={(e) => this.handleBadHabitsSelect("alcohol", e.target.value)}
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
                                onChange={() => this.toggleInput("showSmokingAmount", "yes")}
                            />{" "}
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="smoking"
                                value="no"
                                onChange={() => this.toggleInput("showSmokingAmount", "no")}
                            />{" "}
                            No
                        </label>
                    </div>

                    {this.state.showSmokingAmount && (
                        <div id="smoking-amount">
                            <h2>If yes, how much?</h2>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="pocet cigaret denne"
                                onBlur={(e) => this.handleBadHabitsSelect("smoking", e.target.value)}
                            />
                        </div>
                    )}

                    <button className="next-button" onClick={this.handleNextClick}>
                        Next
                    </button>
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
