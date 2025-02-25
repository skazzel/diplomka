import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/MainSymptom.less";
import { HPatientSection } from "./HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";

export abstract class MainSymptom<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class MainSymptomView<T extends ISectionProps> extends MainSymptom<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            selectedSymptoms: props.selectedSymptoms || [],
        };
    }

    handleBackClick = (): void => {
        console.log("Navigating to HPatientViewSelection...");
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleNextClick = (): void => {
        console.log("Navigating to HPatientViewSelection...");
        if (this.props.dispatch) {
            //this.props.dispatch(new SwitchViewAction(PersonalInfoSection.defaultView));
            console.log("next");
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    render(): ReactNode {
        return (
            <>
            <div className="container">
                <button className="back-button">← Back</button>

                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                    <span className="progress-text">Symptoms of concern</span>
                </div>

                <h2>What symptom are you particularly concerned about at this time? Please tell us just one.</h2>

                <div className="symptom-list">
                    {this.state.selectedSymptoms.map((symptom, index) => (
                        <label key={index} className="symptom-option">
                            <input type="radio" name="symptom" />
                            <span className="symptom-label">{symptom}</span>
                        </label>
                    ))}
                </div>

                <button className="next-button">to the next</button>
            </div>

            </>
        );
    }
}

const MainSymptomSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: MainSymptomView,
};

export { MainSymptomSection };
