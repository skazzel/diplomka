import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/operation.less";
import { SwitchViewAction } from "../../../data/AppAction";
import Axios from "axios";
import { HBox, VBox } from "../../HCard";
import { EnumRole } from "../../../data/UserData";
import { ChronicalSinceSection } from "./chronicSince";
import { BadHabbitsSection } from "./BadHabbits";
import { HButton, HButtonStyle } from "../../HButton";
import { ChronicalSection } from "./ChronicalView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class SurgeryType<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class SurgeryTypeView<T extends ISectionProps> extends SurgeryType<T> {
    constructor(props: T) {
        super(props);
        let stored = JSON.parse(localStorage.getItem("selectedSurgeries") || "[]");
        if (!Array.isArray(stored)) stored = [];

        // Pokud je "None" jediná položka, ignoruj ji při návratu zpět
        const isNoneOnly = stored.length === 1 && stored[0] === t("Neguje");
        const valid = isNoneOnly ? [] : stored.filter((s) => typeof s === "string" && s.trim() !== "");

        this.state = {
            selectedSurgeries: valid,
            userSearch: [],
            searchString: "",
            errorText: "",
            progress: getProgress("operationView", "default")
        };
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const chronicalEntry = answers.find((entry: any) => entry.hasOwnProperty("chronicCondition"));
        const isNone = chronicalEntry && Array.isArray(chronicalEntry.chronicCondition) && chronicalEntry.chronicCondition.includes("Neguje");

        if (isNone) {
            this.props.dispatch(new SwitchViewAction(ChronicalSection.defaultView));
        } else {
            this.props.dispatch(new SwitchViewAction(ChronicalSinceSection.defaultView));
        }
    };

    handleSelectSurgery = (surgery: string): void => {
        this.setState((prevState) => {
            if (prevState.selectedSurgeries.includes(surgery)) return prevState;
            const updated = [...prevState.selectedSurgeries, surgery];
            localStorage.setItem("selectedSurgeries", JSON.stringify(updated));
            return { selectedSurgeries: updated };
        });
    };

    removeSurgery = (toRemove: string): void => {
        this.setState((prevState) => {
            const updated = prevState.selectedSurgeries.filter(s => s !== toRemove);
            localStorage.setItem("selectedSurgeries", JSON.stringify(updated));
            return { selectedSurgeries: updated };
        });
    };

    performSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const keyword = e.target.value.trim();
        this.setState({ searchString: keyword });
    
        if (keyword === "") {
            this.setState({ userSearch: [], errorText: "" });
            return;
        }
    
        const lang = localStorage.getItem("language") || "cz";
    
        Axios.get("/operations/info", {
            params: {
                operation: keyword + "%",
                role: this.props.searchRole === EnumRole.PATIENT,
                lang: lang
            },
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        })
        .then((response) => {
            const results = Array.isArray(response.data) ? response.data : [];
            this.setState({
                userSearch: results,
                errorText: results.length === 0 ? t("error_symptom_search") : ""
            });
        })
        .catch(() => {
            this.setState({
                userSearch: [],
                errorText: t("error_symptom_search")
            });
        });
    };
    
    saveAndProceed = (surgeries: string[]): void => {
        const finalAnswers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        const surgeriesEntry = { surgeries };
        const existingIndex = finalAnswers.findIndex((entry: any) => entry.hasOwnProperty("surgeries"));

        if (existingIndex !== -1) {
            finalAnswers[existingIndex] = surgeriesEntry;
        } else {
            finalAnswers.push(surgeriesEntry);
        }

        localStorage.setItem("patientAnswers", JSON.stringify(finalAnswers));
        localStorage.setItem("selectedSurgeries", JSON.stringify(surgeries));

        this.props.dispatch(new SwitchViewAction(BadHabbitsSection.defaultView));
    };

    handleNext = () => {
        if (this.state.selectedSurgeries.length === 0) {
            return;
        }
        this.saveAndProceed(this.state.selectedSurgeries);
    };
    

    handleNoSurgeries = () => this.saveAndProceed([t("Neguje")]);

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container" id="symptom-input">
                    <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
                    <div className="progress-container">
                        <div className="progress-bar-wrapper">
                            <div className="progress-bar">
                                <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                            </div>
                            <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                        </div>
                        <span className="progress-label">{t("progress_basic_info")}</span>
                    </div>
                    <h2>{t("surgery_question")}</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input
                                type="text"
                                value={this.state.searchString}
                                onChange={this.performSearch}
                                placeholder={t("surgery_search_placeholder")}
                            />
                        </HBox>

                        {this.state.errorText && this.state.userSearch.length === 0 && (
                            <div className="hs-userbox-error">
                                {this.state.errorText}
                            </div>
                        )}

                        {this.state.userSearch.length > 0 && (
                            <div className="scrollable-results">
                                {this.state.userSearch.map(s => (
                                    <div className="search-result-row" key={s.id}>
                                        <div className="search-result-name">{s.name}</div>
                                        <div className="search-result-button">
                                            <HButton
                                                buttonStyle={HButtonStyle.TEXT_SYMPTOM}
                                                action={() => this.handleSelectSurgery(s.name)}
                                            >
                                                {t("select")}
                                            </HButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </VBox>

                    <div className="selected-symptoms-container">
                        <h3>{t("selected_surgeries")}</h3>
                        <ul className="selected-symptoms-list">
                            {this.state.selectedSurgeries.map((s, i) => (
                                <li key={i}>
                                    • {s}
                                    <span className="delete-symptom" onClick={() => this.removeSurgery(s)}>🗑️ {t("delete")}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="buttons-row">
                        <button className="button-next" onClick={this.handleNext}>{t("button_next")}</button>
                        <button className="button-skip" onClick={this.handleNoSurgeries}>
                            {t("surgery_none")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

const SurgeryTypeSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: SurgeryTypeView,
};

export { SurgeryTypeSection };
