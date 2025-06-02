import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/social.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { GynecologySection } from "./GynecologyView";
import { AllergyMedicationSelection } from "./AllergyMedicationView";
import { ReferredDoctorSection } from "./ReferralUploadView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class Social<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class SocialView<T extends ISectionProps> extends Social<T> {
    constructor(props: T) {
        super(props);

        const stored = JSON.parse(localStorage.getItem("socialInfo") || "{}");

        this.state = {
            employmentStatus: stored.employmentStatus || "",
            livingWith: stored.livingWith || "",
            residenceType: stored.residenceType || "",
            apartmentFloor: stored.apartmentFloor || "",
            hasElevator: stored.hasElevator || "",
            isForeigner: stored.isForeigner || "",
            foreignerOrigin: stored.foreignerOrigin || "",
            foreignerReason: stored.foreignerReason || "",
            traveledOutsideEurope: stored.traveledOutsideEurope || "",
            progress: getProgress("socialView", "default")
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("socialInfo", JSON.stringify(this.state));
    }

    handleNextClick = (): void => {
        const {
            employmentStatus,
            livingWith,
            residenceType,
            apartmentFloor,
            hasElevator,
            isForeigner,
            foreignerOrigin,
            foreignerReason,
            traveledOutsideEurope
        } = this.state;
    
        if (
            !employmentStatus ||
            !livingWith ||
            !residenceType ||
            (residenceType === "panelák" && (!apartmentFloor || !hasElevator)) ||
            !isForeigner ||
            (isForeigner === "ano" && (!foreignerOrigin || !foreignerReason)) ||
            !traveledOutsideEurope
        ) {

            return;
        }

        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
        const cz = (key: string, value: string): string => {
            const map: Record<string, string> = {
                ano: "Ano",
                ne: "Ne",
                pracuji: "Pracuji",
                studuji: "Studuji",
                "v důchodu": "V důchodu",
                nezaměstnaný: "Nezaměstnaný",
                "sám": "Sám",
                "s rodinou": "S rodinou",
                "s partnerem a dětmi": "S partnerem a dětmi",
                "s přáteli": "S přáteli",
                panelák: "Panelák",
                dům: "Dům",
                studium: "Studium",
                práce: "Práce",
                turismus: "Turismus",
                jiné: "Jiné"
            };
            return map[value] || value;
        };
    
        const entry = {
            employmentStatus: cz("employmentStatus", this.state.employmentStatus),
            livingWith: cz("livingWith", this.state.livingWith),
            residenceType: cz("residenceType", this.state.residenceType),
            apartmentFloor:
                this.state.residenceType === "panelák" ? this.state.apartmentFloor : undefined,
            hasElevator:
                this.state.residenceType === "panelák" ? cz("hasElevator", this.state.hasElevator) : undefined,
            isForeigner: cz("isForeigner", this.state.isForeigner),
            foreignerOrigin:
                this.state.isForeigner === "ano" ? this.state.foreignerOrigin : undefined,
            foreignerReason:
                this.state.isForeigner === "ano" ? cz("foreignerReason", this.state.foreignerReason) : undefined,
            traveledOutsideEurope: cz("traveledOutsideEurope", this.state.traveledOutsideEurope)
        };
    
        const alreadyExists = answers.some(
            (existing) => JSON.stringify(existing) === JSON.stringify(entry)
        );
    
        if (!alreadyExists) {
            answers.push(entry);
            localStorage.setItem("patientAnswers", JSON.stringify(answers));
            console.log("📦 Sociální odpovědi uloženy:", entry);
        }
    
        this.props.dispatch(new SwitchViewAction(ReferredDoctorSection.defaultView));
    };
    

    handleBackClick = (): void => {
        let answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        answers = answers.filter((entry: any) => !entry.hasOwnProperty("medication_allergy"));
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("🗑️ Removed 'medication_allergy' from patientAnswers:", answers);

        this.props.dispatch(new SwitchViewAction(AllergyMedicationSelection.defaultView));
    };

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container">
                    <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
                    <div className="scrollable-content">
                        <div className="progress-container">
                            <div className="progress-bar-wrapper">
                                <div className="progress-bar">
                                    <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                                </div>
                                <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                            </div>
                            <span className="progress-label">{t("progress_basic_info")}</span>
                        </div>

                        <h2>{t("social_q1")}</h2>
                        <select value={this.state.employmentStatus} onChange={(e) => this.setState({ employmentStatus: e.target.value })}>
                            <option value="">-- {t("select_option")} --</option>
                            <option value="pracuji">{t("social_employed")}</option>
                            <option value="studuji">{t("social_student")}</option>
                            <option value="v důchodu">{t("social_retired")}</option>
                            <option value="nezaměstnaný">{t("social_unemployed")}</option>
                        </select>

                        <h2>{t("social_q2")}</h2>
                        <select value={this.state.livingWith} onChange={(e) => this.setState({ livingWith: e.target.value })}>
                            <option value="">-- {t("select_option")} --</option>
                            <option value="sám">{t("social_alone")}</option>
                            <option value="s rodinou">{t("social_family")}</option>
                            <option value="s partnerem a dětmi">{t("social_partner_children")}</option>
                            <option value="s přáteli">{t("social_friends")}</option>
                        </select>

                        <h2>{t("social_q3")}</h2>
                        <select value={this.state.residenceType} onChange={(e) => this.setState({ residenceType: e.target.value })}>
                            <option value="">-- {t("select_option")} --</option>
                            <option value="panelák">{t("social_apartment")}</option>
                            <option value="dům">{t("social_house")}</option>
                        </select>

                        {this.state.residenceType === "panelák" && (
                            <>
                                <h2>{t("social_q3a")}</h2>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    placeholder={t("social_floor_placeholder")}
                                    value={this.state.apartmentFloor}
                                    onChange={(e) => this.setState({ apartmentFloor: e.target.value })}
                                />

                                <h2>{t("social_q3b")}</h2>
                                <select value={this.state.hasElevator} onChange={(e) => this.setState({ hasElevator: e.target.value })}>
                                    <option value="">-- {t("select_option")} --</option>
                                    <option value="ano">{t("yes")}</option>
                                    <option value="ne">{t("no")}</option>
                                </select>
                            </>
                        )}

                        <h2>{t("social_q4")}</h2>
                        <select value={this.state.isForeigner} onChange={(e) => this.setState({ isForeigner: e.target.value })}>
                            <option value="">-- {t("select_option")} --</option>
                            <option value="ano">{t("yes")}</option>
                            <option value="ne">{t("no")}</option>
                        </select>

                        {this.state.isForeigner === "ano" && (
                            <>
                                <h2>{t("social_q4a")}</h2>
                                <input
                                    type="text"
                                    placeholder={t("social_origin_placeholder")}
                                    value={this.state.foreignerOrigin}
                                    onChange={(e) => this.setState({ foreignerOrigin: e.target.value })}
                                />

                                <h2>{t("social_q4b")}</h2>
                                <select value={this.state.foreignerReason} onChange={(e) => this.setState({ foreignerReason: e.target.value })}>
                                    <option value="">-- {t("select_option")} --</option>
                                    <option value="studium">{t("reason_study")}</option>
                                    <option value="práce">{t("reason_work")}</option>
                                    <option value="turismus">{t("reason_tourism")}</option>
                                    <option value="jiné">{t("reason_other")}</option>
                                </select>
                            </>
                        )}

                        <h2>{t("social_q5")}</h2>
                        <select value={this.state.traveledOutsideEurope} onChange={(e) => this.setState({ traveledOutsideEurope: e.target.value })}>
                            <option value="">-- {t("select_option")} --</option>
                            <option value="ano">{t("yes")}</option>
                            <option value="ne">{t("no")}</option>
                        </select>
                    </div>

                    <div>
                        <button className="button-next" onClick={this.handleNextClick}>{t("button_next")}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const SocialSelection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: SocialView,
};

export { SocialSelection };
