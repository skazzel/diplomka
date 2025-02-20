/* eslint-disable indent */
import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/patient-quiz.less";
import { GenderInfoSection } from "../patient-view/gender-view"; // ✅ Corrected Import
import { SwitchViewAction } from "../../../data/AppAction"; // ✅ Dispatch switch action
import { PersonalInfoSection } from "./PersonalInfo";

export abstract class HPatientView<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class HPatientWelcomeView<T extends ISectionProps> extends HPatientView<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            showErrorMessage: false, // ✅ State to control error message visibility
        };
    }

    /** ✅ Back Button - Switch to BodyImageView */
    handleBackClick = (): void => {
        console.log("Switching back to BodyImageView"); // ✅ Debugging log
        this.props.dispatch(new SwitchViewAction(PersonalInfoSection.defaultView));
    };

    handleNextClick = (): void => {
        console.log("Switching back to BodyImageView"); // ✅ Debugging log
        this.props.dispatch(new SwitchViewAction(GenderInfoSection.defaultView));
    };

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="patient-container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>7
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What symptom bothers you the most?</h2>
                    <input type="text" placeholder="Enter symptom..." />
                    <div className="tags">
                        <span>My stomach hurts</span>
                        <span>Fever</span>
                        <span>Tired</span>
                        <span>Headache</span>
                        <span>Sore throat</span>
                        <span>Nausea</span>
                    </div>
                    <div className="example">
                        <span>Try entering a short sentence.</span>
                        <span className="good">Good example: "My stomach hurts"</span>
                        <span className="bad">Bad example: "Yesterday when I woke up I had a stomach ache, but now it's a little better."</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        {/* ✅ Back Button - Switches to BodyImageView */}
                        <button
                            className="button"
                            style={{ backgroundColor: '#cccccc', color: 'black' }}
                            onClick={this.handleBackClick}>Back</button>

                        <button
                            className="button"
                            onClick={this.handleNextClick}>Next</button>
                    </div>
                </div>
            </div>
        );
    }
}

/** ✅ Updated Section Export */
const HPatientSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: HPatientWelcomeView,
};

export { HPatientSection };
