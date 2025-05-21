import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { SwitchViewAction, LoginAction } from "../../../data/AppAction";
import { MainSymptomSection } from "./MainSymptom";
import Axios from "axios";
import { IAPIResponse, ILoginData } from "../../../data/UserData";
import { HPatientSection } from "./HPatientView";
import { BodyImageSection } from "./BodyImage";
import "../../../style/generalStyle.less";
import { ReferredDoctorSection } from "./ReferralUploadView";

export abstract class GenderInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

interface GenderInfoState {
    rcBefore: string;
    rcAfter: string;
}

let alreadyCleared = false;

export class GenderInfoView<T extends ISectionProps> extends GenderInfo<T> {
    state: GenderInfoState = {
        rcBefore: localStorage.getItem("rcBefore") || "",
        rcAfter: localStorage.getItem("rcAfter") || ""
    };

    constructor(props: T) {
        super(props);

        const navType = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const isReload = navType?.type === "reload";

        if (isReload && !alreadyCleared) {
            localStorage.removeItem("patientAnswers");
            localStorage.removeItem("selectedSymptoms");
            localStorage.removeItem("selectedDiseases");
            localStorage.removeItem("rcBefore");
            localStorage.removeItem("rcAfter");
            localStorage.removeItem("selectedMainSymptom");
            localStorage.removeItem("symptomNearbyOption");
            localStorage.removeItem("selectedSurgeries");
            localStorage.removeItem("badHabits");
            localStorage.removeItem("drugsData");
            localStorage.removeItem("selectedPainAreas");
            localStorage.removeItem("allergyFood");
            localStorage.removeItem("selectedMedicationAllergies");
            localStorage.removeItem("socialInfo");
            localStorage.removeItem("referredDoctor");
            localStorage.removeItem("chronicalSince");
            localStorage.removeItem("gynecologyInfo");
            localStorage.removeItem("selectedCondition");
            localStorage.removeItem("previousTrouble");
            localStorage.removeItem("medicationDetails");
            localStorage.removeItem("selectedMedications");
            localStorage.removeItem("durationNumber");
            localStorage.removeItem("durationUnit");
            localStorage.removeItem("painChoice");
            alreadyCleared = true;
        }

        this.checkAndAutoLogin();
    }

    checkAndAutoLogin = (): void => {
        const user = this.props.user;
        if (user && user.username) {
            console.log(`✅ Already logged in as ${user.username}`);
        } else {
            this.autoLogin();
        }
    };

    autoLogin = (): void => {
        Axios({
            url: "/users/login",
            method: "POST",
            data: {
                username: "petr",
                password: "petr11"
            }
        }).then((response) => {
            const apiResponse = response.data as IAPIResponse;
            if (apiResponse.code === 200) {
                const loginData = apiResponse as ILoginData;
                this.props.dispatch(new LoginAction(loginData));
            } else {
                console.error("❌ Login failed:", apiResponse);
            }
        }).catch((err) => {
            console.error("❌ Error during auto-login:", err);
        });
    };

    parseBirthNumber = (rc: string): { gender: string; age: number } | null => {
        if (!/^\d{6}\/\d{3,4}$/.test(rc)) return null;

        const [datePart] = rc.split("/");
        let year = parseInt(datePart.substring(0, 2), 10);
        let month = parseInt(datePart.substring(2, 4), 10);
        const day = parseInt(datePart.substring(4, 6), 10);

        let gender = "Male";
        if (month > 50) {
            gender = "Female";
            month -= 50;
        }

        const currentYear = new Date().getFullYear();
        const currentShortYear = parseInt(currentYear.toString().slice(-2));
        const fullYear = year <= currentShortYear ? 2000 + year : 1900 + year;

        const birthDate = new Date(fullYear, month - 1, day);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        return { gender, age };
    };

    handleSubmit = (): void => {
        const rcBefore = this.state.rcBefore.trim();
        const rcAfter = this.state.rcAfter.trim();

        if (rcBefore.length !== 6 || rcAfter.length < 3) {
            alert("Zadejte prosím platné rodné číslo ve formátu YYMMDD/XXX[X]");
            return;
        }

        const rc = `${rcBefore}/${rcAfter}`;
        const result = this.parseBirthNumber(rc);

        if (!result) {
            alert("Neplatné rodné číslo. Použijte formát YYMMDD/XXX[X]");
            return;
        }

        const answers = [
            { key: "gender", value: result.gender },
            { key: "age", value: result.age },
            { key: "birthNumber", value: rc }
        ];

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        localStorage.setItem("rcBefore", rcBefore);
        localStorage.setItem("rcAfter", rcAfter);

        this.props.dispatch(new SwitchViewAction(ReferredDoctorSection.defaultView));
    };

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container">
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                        <span className="progress-label">Basic Information</span>
                    </div>

                    <h2>Please enter your birth number (rodné číslo)</h2>
                    <p>We will determine gender and age from it automatically.</p>

                    <div className="rc-input-container">
                        <input
                            type="text"
                            className="rc-input"
                            placeholder="YYMMDD"
                            maxLength={6}
                            value={this.state.rcBefore}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                this.setState({ rcBefore: value }, () => {
                                    if (value.length === 6) {
                                        document.getElementById("rc-after")?.focus();
                                    }
                                });
                            }}
                        />
                        <input
                            id="rc-after"
                            type="text"
                            className="rc-input"
                            placeholder="XXXX"
                            maxLength={4}
                            value={this.state.rcAfter}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                this.setState({ rcAfter: value });
                            }}
                        />
                    </div>

                    <button className="button-next" onClick={this.handleSubmit}>Next</button>
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
