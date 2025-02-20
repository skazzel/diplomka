/* eslint-disable indent */
import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { HPatientSection } from "../patient-view/HPatientView"; // ✅ Correct reference
import { SwitchViewAction } from "../../../data/AppAction"; // ✅ Import action
import { BodyImageSection } from "../patient-view/BodyImage"; // ✅ Corrected Import

export abstract class GenderInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class GenderInfoView<T extends ISectionProps> extends GenderInfo<T> {
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
            this.props.dispatch(new SwitchViewAction(BodyImageSection.defaultView));
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
                        <div className="progress completed"></div>
                        <div className="progress active"></div>
                        <div className="progress pending"></div>
                    </div>
                    <span className="progress-label">basic information</span>
                </div>

                <h2>Please tell us the gender of the person whose symptoms you want to check.</h2>
                <p>The association of diseases with gender will be taken into consideration.</p>

                <div className="info-box">
                    <p><strong>If you want to check symptoms</strong>Family (spouse, children, etc.)</p>
                </div>

                <p className="subtext">Gender here refers to biological divisions.</p>

                <button className="gender-button">male</button>
                <button className="gender-button">woman</button>
            </div>
            </>
        );
    }
}

const GenderInfoSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: GenderInfoView,
};

export { GenderInfoSection };
