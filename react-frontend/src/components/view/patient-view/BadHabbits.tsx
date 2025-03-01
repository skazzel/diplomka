import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { PersonalInfoSection } from "./PersonalInfo";
import Axios from "axios";
import {EnumRole} from "../../../data/UserData";
import { ChronicalSection } from "./ChronicalView";


export abstract class BadHabbits<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class BadHabbitsView<T extends ISectionProps> extends BadHabbits<T> {
    constructor(props: T) {
        super(props);
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

    handleNextClick = (): void => {
        console.log("Navigating to HPatientViewSelection...");
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(PersonalInfoSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleBackClick = (): void => {
        console.log("Navigating to HPatientViewSelection...");
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
            console.log("back");
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleGenderSelect = (gender: string): void => {
        console.log("Gender Selected:", gender);

        const uid = this.props.loginData?.id ? this.props.loginData.id : "@self";

        Axios.post(`/users/${uid}/patient-info-create`, 
            null, 
            {
                params: { gender: gender },
                headers: {
                    Authorization: "Bearer " + this.props.loginData.token
                }
            })
            .then((response) => {
                console.log("✅ Patient Created:", response.data);
                const data = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
                const patientId = data.patientId;
    
                if (patientId !== undefined) {
                    localStorage.setItem("patientId", patientId.toString());
                    console.log("🔹 Stored patient ID:", patientId);
                } else {
                    console.error("❌ Error: Patient ID not received.");
                }
            })
            .catch((error) => {
                console.error("❌ Error creating patient:", error);
            });
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

const BadHabbitsSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: BadHabbitsView,
};

export { BadHabbitsSection };
