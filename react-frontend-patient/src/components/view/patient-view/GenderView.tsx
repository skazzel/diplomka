import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";

export abstract class GenderInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class GenderInfoView<T extends ISectionProps> extends GenderInfo<T> {
    constructor(props: T) {
        super(props);
        localStorage.removeItem("patientAnswers"); // ✅ Clear list when entering Gender View
    }

    handleGenderSelect = (gender: string): void => {
        let answers = [{ gender }];
        localStorage.setItem("patientAnswers", JSON.stringify(answers));

        this.handleNextClick();
    };

    handleNextClick = (): void => {
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(PersonalInfoSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    render(): ReactNode {
        return (
            <div className="genderview">
                <div className="container">
                    <button className="back-button" onClick={() => window.history.back()}>← Back</button>

                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                        <span className="progress-label">Basic Information</span>
                    </div>

                    <h2>Please tell us the gender of the person whose symptoms you want to check.</h2>
                    <p>The association of diseases with gender will be taken into consideration.</p>

                    <button className="gender-button" onClick={() => this.handleGenderSelect("Male")}>
                        Male
                    </button>

                    <button className="gender-button" onClick={() => this.handleGenderSelect("Female")}>
                        Female
                    </button>
                </div>
            </div>
        );
    }
}

const GenderInfoSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: GenderInfoView,
};

export { GenderInfoSection };
