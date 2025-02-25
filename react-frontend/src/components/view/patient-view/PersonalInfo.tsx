import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/personal-info.less";
import { HPatientSection } from "../patient-view/HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";
import { GenderInfoSection } from "./GenderView"

export abstract class PersonalInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PersonalInfoView<T extends ISectionProps> extends PersonalInfo<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            age: 30, // Default age value
        };
    }

    changeAge = (amount: number): void => {
        this.setState((prevState: any) => {
            const newAge = Math.min(120, Math.max(0, prevState.age + amount)); // Ensure valid range
            return { age: newAge };
        });
    };

    updateAge = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ age: parseInt(event.target.value, 10) || 0 });
    };

    handleNextClick = (): void => {
        console.log("Navigating to HPatientViewSelection..."); // ✅ Debugging log
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleBackClick = (): void => {
        console.log("Navigating to HPatientViewSelection..."); // ✅ Debugging log
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(GenderInfoSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    render(): ReactNode {
        return (
            <>
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                    <div className="progress-bar">
                        <div className="progress"></div>
                    </div>

                    <h2>Please tell us the age of the person you want to check for symptoms.</h2>

                    <div className="slider-container">
                        <button onClick={() => this.changeAge(-1)}>-</button>
                        <span>Age: {this.state.age}</span>
                        <button onClick={() => this.changeAge(1)}>+</button>
                    </div>

                    <input
                        type="range"
                        id="ageSlider"
                        min="0"
                        max="120"
                        value={this.state.age}
                        onChange={this.updateAge}
                    />

                    <div>
                        <button className="button next-button" onClick={this.handleNextClick}>To the Next</button>
                    </div>
                </div>
            </>
        );
    }
}

const PersonalInfoSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: PersonalInfoView,
};

export { PersonalInfoSection };
