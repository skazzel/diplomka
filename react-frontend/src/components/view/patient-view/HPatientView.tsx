import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/patient-quiz.less";

export abstract class HPatientView<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class HPatientWelcomeView<T extends ISectionProps> extends HPatientView<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            showErrorMessage: false, // State to control error message visibility
        };
    }

    validateForm = (): boolean => {
        const inputs = document.querySelectorAll('.container.active input');
        let allValid = true;

        inputs.forEach(input => {
            const value = (input as HTMLInputElement).value.trim();
            const id = input.id;

            switch (id) {
                case 'name':
                    if (!/^[a-zA-Zá-žÁ-Ž ]+$/.test(value)) allValid = false;
                    break;

                case 'dob':
                    const today = new Date();
                    const dateValue = new Date(value);
                    if (!value || dateValue >= today || isNaN(dateValue.getTime())) allValid = false;
                    break;

                case 'address':
                    if (value.length < 5) allValid = false;
                    break;

                case 'nid':
                    if (!/^(\d{6}\/?\d{3,4})$/.test(value)) allValid = false;
                    break;

                case 'phone':
                    if (!/^\d{9}$/.test(value)) allValid = false;
                    break;

                case 'insurance':
                    if (value.length < 3) allValid = false;
                    break;

                default:
                    break;
            }
        });

        this.setState({ showErrorMessage: !allValid });
        return allValid;
    };

    handleButtonClick = (): void => {
        if (this.validateForm()) {
            const personalDetailsContainer = document.getElementById('personal-details');
            const symptomInputContainer = document.getElementById('symptom-input');

            if (personalDetailsContainer && symptomInputContainer) {
                personalDetailsContainer.classList.remove('active');
                symptomInputContainer.classList.add('active');
                this.setState({ showErrorMessage: false });
            }
        }
    };

    render(): ReactNode {
        return (
            <>
            <div className="patient-view">
                <div className="container active" id="personal-details">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>Welcome Patient! Please fill in the personal details</h2>

                    <div className="input-section">
                        <label htmlFor="name">Name and Surname</label>
                        <input type="text" id="name" placeholder="Enter your full name" required />

                        <label htmlFor="dob">Date of Birth</label>
                        <input type="date" id="dob" required />

                        <label htmlFor="address">Address</label>
                        <input type="text" id="address" placeholder="Enter your address" required />

                        <label htmlFor="nid">National ID Number</label>
                        <input type="text" id="nid" placeholder="Enter your national ID number" required />

                        <label htmlFor="phone">Phone Number</label>
                        <input type="text" id="phone" placeholder="Enter your phone number" required />

                        <label htmlFor="insurance">Insurance Provider and Number</label>
                        <input type="text" id="insurance" placeholder="Enter your insurance details" required />
                    </div>

                    {this.state.showErrorMessage && (
                        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                            Information was filled incorrectly. Please check the fields.
                        </div>
                    )}

                    <button className="button" id="next-button" onClick={this.handleButtonClick}>
                        To the Next
                    </button>
                </div>

                <div className="container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>
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
                        <button
                            className="button"
                            style={{ backgroundColor: '#cccccc', color: 'black' }}
                            onClick={() => {
                                document.getElementById('symptom-input').classList.remove('active');
                                document.getElementById('personal-details').classList.add('active');
                            }}
                        >
                            Back
                        </button>

                        <button className="button">
                            Next
                        </button>
                    </div>
                </div>
                </div>
            </>
        );
    }
}

const HPatientSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: HPatientWelcomeView,
};

export { HPatientSection };
