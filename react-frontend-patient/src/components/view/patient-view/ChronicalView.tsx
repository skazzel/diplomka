import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { HBox, VBox } from "../../HCard";
import { HButton, HButtonStyle } from "../../HButton";
import Axios from "axios";
import { EnumRole } from "../../../data/UserData";
import { MainConditionSection } from "./ConditionView";
import { ChronicalSinceSection } from "./chronicSince";
import { SurgeryTypeSection } from "./operationView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class Chronical<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class ChronicalView<T extends ISectionProps> extends Chronical<T> {
    constructor(props: T) {
        super(props);
        let stored = JSON.parse(localStorage.getItem("selectedDiseases") || "[]");
        if (!Array.isArray(stored)) stored = [];
    
        const validDiseases = stored.includes("Neguje") && stored.length === 1
            ? [] // Pokud bylo vybráno pouze "Neguje", zobrazíme prázdný seznam
            : stored.filter(d => typeof d === "string" && d.trim() !== "");
    
        this.state = {
            selectedDiseases: validDiseases,
            searchString: "",
            userSearch: [],
            errorText: "",
            progress: getProgress("chronicalView", "default")
        };
    }    

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter(
            (entry: any) => !entry.hasOwnProperty("condition") && !entry.hasOwnProperty("previousTrouble") && !entry.hasOwnProperty("duration")
        );
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
        this.props.dispatch(new SwitchViewAction(MainConditionSection.defaultView));
    };

    handleSelectSymptom = (disease: string): void => {
        this.setState((prevState) => {
            if (prevState.selectedDiseases.includes(disease)) return prevState;
            const updated = [...prevState.selectedDiseases, disease];
            localStorage.setItem("selectedDiseases", JSON.stringify(updated));
            return { selectedDiseases: updated };
        });
    };

    removeSymptom = (disease: string): void => {
        this.setState((prevState) => {
            const updated = prevState.selectedDiseases.filter(d => d !== disease);
            localStorage.setItem("selectedDiseases", JSON.stringify(updated));
            return { selectedDiseases: updated };
        });
    };

    performSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.trim();
        this.setState({ searchString: value });
    
        if (!value) {
            this.setState({ userSearch: [], errorText: "" });
            return;
        }
    
        const lang = localStorage.getItem("language") || "cz";
    
        Axios.get("/diseases/info", {
            params: {
                disease: value + "%",
                role: this.props.searchRole === EnumRole.PATIENT,
                lang: lang
            },
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        })
        .then((res) => {
            const results = Array.isArray(res.data) ? res.data : [];
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

    saveAndProceed = (diseases: string[]): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const chronicEntry = { chronicCondition: diseases };
        const existingIndex = answers.findIndex((entry: any) => entry.hasOwnProperty("chronicCondition"));

        if (existingIndex !== -1) {
            answers[existingIndex] = chronicEntry;
        } else {
            answers.push(chronicEntry);
        }

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        localStorage.setItem("selectedDiseases", JSON.stringify(diseases));

        const isNone = diseases.length === 1 && diseases[0] === "Neguje";
        console.log("WTF " + diseases[0]);
        const nextSection = isNone ? SurgeryTypeSection.defaultView : ChronicalSinceSection.defaultView;

        this.props.dispatch(new SwitchViewAction(nextSection));
    };

    handleNext = () => {
        if (this.state.selectedDiseases.length === 0) {
            return;
        }
        this.saveAndProceed(this.state.selectedDiseases);
    };
    

    handleNoChronic = () => this.saveAndProceed(["Neguje"]);

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

                    <h2>{t("chronic_question")}</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input
                                type="text"
                                value={this.state.searchString}
                                onChange={this.performSearch}
                                placeholder={t("chronic_search_placeholder")}
                            />
                        </HBox>

                        {this.state.errorText && this.state.userSearch.length === 0 && (
                            <div className="hs-userbox-error">
                                {this.state.errorText}
                            </div>
                        )}

                        {this.state.userSearch.length > 0 && (
                            <div className="scrollable-results">
                                {this.state.userSearch.map(d => (
                                    <div className="search-result-row" key={d.id}>
                                        <div className="search-result-name">{d.disease}</div>
                                        <div className="search-result-button">
                                            <HButton
                                                buttonStyle={HButtonStyle.TEXT_SYMPTOM}
                                                action={() => this.handleSelectSymptom(d.disease)}
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
                        <h3>{t("selected_conditions")}</h3>
                        <ul className="selected-symptoms-list">
                            {this.state.selectedDiseases.map((disease, index) => (
                                <li key={index}>
                                    • {disease} <span className="delete-symptom" onClick={() => this.removeSymptom(disease)}>🗑️ {t("delete")}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="buttons-row">
                        <button className="button-next" onClick={this.handleNext}>{t("button_next")}</button>
                        <button className="button-skip" onClick={this.handleNoChronic}>{t("button_no_chronic_diseases")}</button>

                    </div>
                </div>
            </div>
        );
    }
}

const ChronicalSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: ChronicalView,
};

export { ChronicalSection };
