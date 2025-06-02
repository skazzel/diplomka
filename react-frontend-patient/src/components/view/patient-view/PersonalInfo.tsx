import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
//import "../../../style/personal-info.less";
import { HPatientSection } from "../patient-view/HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";
import { GenderInfoSection } from "./GenderView";

export abstract class PersonalInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PersonalInfoView<T extends ISectionProps> extends PersonalInfo<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            age: 30, 
        };
    }

    changeAge = (amount: number): void => {
        this.setState((prevState: any) => {
            const newAge = Math.min(120, Math.max(0, prevState.age + amount));
            return { age: newAge };
        });
    };

    updateAge = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ age: parseInt(event.target.value, 10) || 0 });
    };

    saveAgeAndProceed = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers.push({ age: this.state.age });
        localStorage.setItem("patientAnswers", JSON.stringify(answers));


        this.handleNextClick();
    };

    handleNextClick = (): void => {
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleBackClick = (): void => {
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(GenderInfoSection.defaultView));
        } else {
            console.error("Error: Dispatch function missing.");
        }
    };

    removeLastEntryAndGoBack = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        
        if (answers.length > 0) {
            answers.pop(); // Remove the last added entry
            localStorage.setItem("patientAnswers", JSON.stringify(answers));
        }

        this.handleBackClick();
    };

    render(): ReactNode {
        return (
            <div className="container">
                <button className="back-button" onClick={this.removeLastEntryAndGoBack}>← Back</button>
                <div className="progress-bar">
                    <div className="progress"></div>
                </div>

                <h2>Please tell us the age of the person you want to check for symptoms.</h2>

                <div className="number-input-row">
                <label htmlFor="ageInput" className="age-label">Age:</label>
                <input
                    id="ageInput"
                    type="number"
                    min="0"
                    max="120"
                    value={this.state.age}
                    onChange={this.updateAge}
                    className="age-number-input"
                    placeholder="e.g. 30"
                />
                </div>



                <div>
                    <button className="button next-button" onClick={this.saveAgeAndProceed}>To the Next</button>
                </div>
            </div>
        );
    }
}

const PersonalInfoSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: PersonalInfoView,
};

export { PersonalInfoSection };
