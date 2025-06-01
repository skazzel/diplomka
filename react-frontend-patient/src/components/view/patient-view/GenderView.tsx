import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/genders.less";
import { SwitchViewAction, LoginAction } from "../../../data/AppAction";
import { ReferredDoctorSection } from "./ReferralUploadView";
import Axios from "axios";
import { IAPIResponse, ILoginData } from "../../../data/UserData";
import "../../../style/generalStyle.less";
import birdImg from "../../../img/bird.png";
import { BodyImageSection } from "./BodyImage";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";

export abstract class GenderInfo<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

interface GenderInfoState {
    birthNumber: string;
    progress: number;
    language: string;
}

let alreadyCleared = false;

export class GenderInfoView<T extends ISectionProps> extends GenderInfo<T> {
    state: GenderInfoState = {
        birthNumber: localStorage.getItem("birthNumber") || "",
        progress: 0,
        language: localStorage.getItem("language") || "cz"
    };

    constructor(props: T) {
        super(props);

        const navType = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const isReload = navType?.type === "reload";
        const progress = getProgress("currentScreenName", "nextScreenName");

        this.setState({ progress });

        if (isReload && !alreadyCleared) {
            const lang = localStorage.getItem("language");
            localStorage.clear();
            if (lang) localStorage.setItem("language", lang);
            alreadyCleared = true;
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
        const cleanRc = rc.replace("/", "");
        if (cleanRc.length < 6) return null;

        let year = parseInt(cleanRc.substring(0, 2), 10);
        let month = parseInt(cleanRc.substring(2, 4), 10);
        const day = parseInt(cleanRc.substring(4, 6), 10);

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

    handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const lang = e.target.value;
        localStorage.setItem("language", lang);
        this.setState({ language: lang }, () => {
            window.location.reload();
        });
    };

    handleSubmit = (): void => {
        const rc = this.state.birthNumber.trim().replace("/", "");
        const result = this.parseBirthNumber(rc);
    
        const answers: any[] = [];
    
        if (result?.gender) {
            answers.push({ gender: result.gender });
        }
    
        if (typeof result?.age === "number" && !isNaN(result.age)) {
            answers.push({ age: result.age });
        }
    
        if (rc !== "") {
            answers.push({ birthNumber: rc });
        }
    
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        localStorage.setItem("birthNumber", rc);
    
        this.setState(
            { progress: getProgress("genderView", "bodyImage") },
            () => this.props.dispatch(new SwitchViewAction(BodyImageSection.defaultView))
          );
    };
    
    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container">
                    <div className="language-row">
                        <label htmlFor="lang-select" className="language-label"></label>
                        <select
                            id="lang-select"
                            value={this.state.language}
                            onChange={this.handleLanguageChange}
                            className="language-select"
                        >
                            <option value="cz">🇨🇿</option>
                            <option value="en">en</option>
                            <option value="uk">uk</option>
                            <option value="de">de</option>
                            <option value="ja">ja</option>
                        </select>
                    </div>

                    <div className="progress-container">
                        <div className="progress-bar-wrapper">
                            <div className="progress-bar">
                                <div
                                    className="progress completed"
                                    style={{ width: `${this.state.progress}%` }}
                                ></div>
                            </div>
                            <img
                                src={birdImg}
                                className="progress-icon"
                                style={{ left: `${this.state.progress}%` }}
                                alt="progress"
                            />
                        </div>
                        <span className="progress-label">{t("progress_basic_info")}</span>
                    </div>

                    <h2>{t("enter_birth_number_title")}</h2>
                    <p>{t("enter_birth_number_subtext")}</p>

                    <div className="rc-input-container">
                        <input
                            type="text"
                            className="rc-input"
                            placeholder="YYMMDDXXXX"
                            maxLength={10}
                            value={this.state.birthNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^\d]/g, "");
                                this.setState({ birthNumber: val });
                            }}
                        />
                    </div>

                    <button className="button-next" onClick={this.handleSubmit}>{t("button_next")}</button>
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
