import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/personal-info.less";
import { HPatientSection } from "../patient-view/HPatientView";
import { SwitchViewAction } from "../../../data/AppAction";
import { GenderInfoSection } from "./GenderView";
import Axios from "axios";

export abstract class PersonalInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class PersonalInfoView<T extends ISectionProps> extends PersonalInfo<T> {
    constructor(props: T) {
        super(props);
        const storedPatientId = localStorage.getItem("patientId");
        this.state = {
            age: 30, 
            patientId: this.props.patientId || storedPatientId || null,
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

    updatePatientAge = (): void => {
        const patientId = localStorage.getItem("patientId"); // ✅ Retrieve patient ID
    
        if (!patientId) {
            console.error("❌ Error: Patient ID is missing.");
            return;
        }
    
        console.log("✅ Sending Update for Patient ID:", patientId);
    
        Axios.post(`/users/${patientId}/patient-info-update`,
            new URLSearchParams({ 
                patientId: patientId, // ✅ Ensure patientId is sent
                age: this.state.age.toString() // ✅ Convert age to string
            }).toString(),
            {
                headers: {
                    Authorization: "Bearer " + this.props.loginData.token,
                    "Content-Type": "application/x-www-form-urlencoded" // ✅ Ensure correct content type
                }
            }
        )
        .then((response) => {
            console.log("✅ Age Updated Successfully:", response.data);
        })
        .catch((error) => {
            console.error("❌ Error updating patient age:", error);
        });
    };

    handleNextClick = (): void => {
        this.updatePatientAge();
        console.log("Navigating to HPatientViewSelection..."); // ✅ Debugging log
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        } else {
            console.error("Dispatch function is missing in props.");
        }
    };

    handleBackClick = (): void => {
        console.log("Navigating to GenderView...");
        if (this.props.dispatch) {
            this.props.dispatch(new SwitchViewAction(GenderInfoSection.defaultView));
        } else {
            console.error("❌ Error: Dispatch function missing.");
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
