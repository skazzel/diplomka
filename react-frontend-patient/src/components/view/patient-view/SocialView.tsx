import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/social.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { GynecologySection } from "./GynecologyView";
import { AllergyMedicationSelection } from "./AllergyMedicationView";
import { ReferredDoctorSection } from "./ReferralUploadView";

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
            traveledOutsideEurope: stored.traveledOutsideEurope || ""
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("socialInfo", JSON.stringify(this.state));
    }

    handleNextClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        const entry = {
            employmentStatus: this.state.employmentStatus,
            livingWith: this.state.livingWith,
            residenceType: this.state.residenceType,
            apartmentFloor:
                this.state.residenceType === "panelák" ? this.state.apartmentFloor : undefined,
            hasElevator:
                this.state.residenceType === "panelák" ? this.state.hasElevator : undefined,
            isForeigner: this.state.isForeigner,
            foreignerOrigin:
                this.state.isForeigner === "ano" ? this.state.foreignerOrigin : undefined,
            foreignerReason:
                this.state.isForeigner === "ano" ? this.state.foreignerReason : undefined,
            traveledOutsideEurope: this.state.traveledOutsideEurope
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
            <div className="container">
                <button className="back-button" onClick={this.handleBackClick}>← Zpět</button>

                <div className="scrollable-content">
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress completed"></div>
                            <div className="progress active"></div>
                            <div className="progress pending"></div>
                        </div>
                        <span className="progress-label">Sociální informace</span>
                    </div>

                    <h2>1. Jaký je váš současný status?</h2>
                    <select value={this.state.employmentStatus} onChange={(e) => this.setState({ employmentStatus: e.target.value })}>
                        <option value="">-- vyberte --</option>
                        <option value="pracuji">Pracuji</option>
                        <option value="studuji">Studuji</option>
                        <option value="v důchodu">Jsem v důchodu</option>
                        <option value="nezaměstnaný">Nezaměstnaný</option>
                    </select>

                    <h2>2. Kde a s kým bydlíte?</h2>
                    <select value={this.state.livingWith} onChange={(e) => this.setState({ livingWith: e.target.value })}>
                        <option value="">-- vyberte --</option>
                        <option value="sám">Sám/Sama</option>
                        <option value="s rodinou">S rodinou</option>
                        <option value="s partnerem a dětmi">S partnerem a dětmi</option>
                        <option value="s přáteli">S přáteli</option>
                    </select>

                    <h2>3. Bydlíte v paneláku nebo v domě?</h2>
                    <select value={this.state.residenceType} onChange={(e) => this.setState({ residenceType: e.target.value })}>
                        <option value="">-- vyberte --</option>
                        <option value="panelák">Panelák</option>
                        <option value="dům">Dům</option>
                    </select>

                    {this.state.residenceType === "panelák" && (
                        <>
                            <h2>Na kterém patře bydlíte?</h2>
                            <input
                                type="number"
                                min="0"
                                max="30"
                                placeholder="např. 3"
                                value={this.state.apartmentFloor}
                                onChange={(e) => this.setState({ apartmentFloor: e.target.value })}
                            />

                            <h2>Máte ve vchodě výtah?</h2>
                            <select value={this.state.hasElevator} onChange={(e) => this.setState({ hasElevator: e.target.value })}>
                                <option value="">-- vyberte --</option>
                                <option value="ano">Ano</option>
                                <option value="ne">Ne</option>
                            </select>
                        </>
                    )}

                    <h2>4. Jste cizinec?</h2>
                    <select value={this.state.isForeigner} onChange={(e) => this.setState({ isForeigner: e.target.value })}>
                        <option value="">-- vyberte --</option>
                        <option value="ano">Ano</option>
                        <option value="ne">Ne</option>
                    </select>

                    {this.state.isForeigner === "ano" && (
                        <>
                            <h2>Odkud pocházíte?</h2>
                            <input
                                type="text"
                                placeholder="Země původu"
                                value={this.state.foreignerOrigin}
                                onChange={(e) => this.setState({ foreignerOrigin: e.target.value })}
                            />

                            <h2>Co děláte v ČR?</h2>
                            <select value={this.state.foreignerReason} onChange={(e) => this.setState({ foreignerReason: e.target.value })}>
                                <option value="">-- vyberte --</option>
                                <option value="studium">Studium</option>
                                <option value="práce">Práce</option>
                                <option value="turismus">Turismus</option>
                                <option value="jiné">Jiné</option>
                            </select>
                        </>
                    )}

                    <h2>5. Vycestoval(a) jste mimo Evropu během posledních 6 měsíců?</h2>
                    <select value={this.state.traveledOutsideEurope} onChange={(e) => this.setState({ traveledOutsideEurope: e.target.value })}>
                        <option value="">-- vyberte --</option>
                        <option value="ano">Ano</option>
                        <option value="ne">Ne</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                    <button className="button" onClick={this.handleNextClick}>Pokračovat</button>
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
