import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import Axios from "axios";
import {EnumRole} from "../../../data/UserData";


export abstract class GenderInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class GenderInfoView<T extends ISectionProps> extends GenderInfo<T> {
    constructor(props: T) {
        super(props);
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

    handleBackClick = (): void => {
        console.log("Navigating to HPatientViewSelection..."); // ✅ Debugging log
        if (this.props.dispatch) {
            //this.props.dispatch(new SwitchViewAction(PersonalInfoSection.defaultView));
            console.log("back");
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleNextClick = (): void => {
        console.log("Navigating to HPatientViewSelection..."); // ✅ Debugging log
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(PersonalInfoSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleGenderSelect = (gender: string): boolean => {
        console.log("Gender:", gender);
    
        const uid = this.props.loginData?.id ? this.props.loginData.id : "@self"; // ✅ Use ID if available
    
        Axios.post(`/users/${uid}/patient-info-create`, 
        null, // ✅ Send as `null` to make sure the request is recognized as a form submission
        {
            params: { gender: gender }, // ✅ Send gender as a query parameter
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        })
        .then((response) => {
            console.log("✅ Patient Created:", response.data);
            this.setState({ patientId: response.data.patientId }, () => {
                this.handleNextClick();
            });
        })
        .catch((error) => {
            console.error("❌ Error creating patient:", error);
        });
    
        return true;
    };
    

    render(): ReactNode {
        return (
            <>
            <div className="container">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>

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

                <button className="gender-button" onClick={() => {
                    this.handleGenderSelect("Male"); 
                    this.handleNextClick();
                }}>
                    Male
                </button>

                <button className="gender-button" onClick={() => {
                    this.handleGenderSelect("Female"); 
                    this.handleNextClick();
                }}>
                    Female
                </button>

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
