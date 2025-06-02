import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode, ChangeEvent } from "react";
import "../../../style/patient-quiz.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";
import { EnumRole } from "../../../data/UserData";
import { PainCheckSection } from "./PainView";
import { MainSymptomSection } from "./MainSymptom";
import { BodyImageSection } from "./BodyImage";
import { MainConditionSection } from "./ConditionView";
import birdImg from "../../../img/bird.png";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import { getProgress } from "../../../data/progressMap";

export abstract class HPatientView<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class HPatientWelcomeView<T extends ISectionProps> extends HPatientView<T> {
    private symptomLabelToIdMap: Record<string, string> = {};
    constructor(props: T) {
        super(props);

        const stored = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]");
        const validSymptoms = Array.isArray(stored) ? stored.filter(s => typeof s === "string" && s.trim() !== "") : [];
        const similarAround = localStorage.getItem("symptomNearbyOption") || "";
        const storedTypes = JSON.parse(localStorage.getItem("symptomTypes") || "{}");

        const types: Record<string, string> = { ...storedTypes };
        let hasPain = validSymptoms.some(sym => types[sym] === "bolest");

        this.symptomLabelToIdMap = {};
        this.state = {
            selectedSymptoms: validSymptoms,
            symptomTypes: types,
            hasPainSymptom: hasPain,
            searchString: "",
            userSearch: [],
            errorText: "",
            similarAround: similarAround,
            progress: getProgress("hpatientView", "default"),
        };

        console.log("\ud83d\udce6 Loaded selectedSymptoms from localStorage:", validSymptoms);
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("age"));
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
        console.log("\ud83d\udd91\ufe0f Removed only 'age', kept selectedSymptoms and similarAround");
        this.props.dispatch(new SwitchViewAction(BodyImageSection.defaultView));
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState(prevState => {
            const updatedSymptoms = prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove);

            const updatedTypes = { ...prevState.symptomTypes };
            delete updatedTypes[symptomToRemove];

            localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));
            localStorage.setItem("symptomTypes", JSON.stringify(updatedTypes));

            const keysToRemove = [
                "patientAnswers", "selectedDiseases", "selectedMainSymptom", "selectedSurgeries", "badHabits",
                "drugsData", "allergyFood", "selectedMedicationAllergies", "socialInfo", "referredDoctor",
                "chronicalSince", "selectedCondition", "previousTrouble", "medicationDetails", "selectedMedications",
                "durationNumber", "durationUnit", "painChoice", "painData"
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));

            return {
                selectedSymptoms: updatedSymptoms,
                symptomTypes: updatedTypes,
                hasPainSymptom: updatedSymptoms.some(sym => updatedTypes[sym] === "bolest"),
            };
        });
    };

    handleSelectSymptom = (selectedSymptom: { id: string, symptom: string, type: string }) => {
        const { id, symptom, type } = selectedSymptom;

        // Uložení do globální mapy pro budoucí využití
        this.symptomLabelToIdMap[symptom] = id;
        localStorage.setItem("symptomLabelToIdMap", JSON.stringify(this.symptomLabelToIdMap));

        console.log("\u{1F4DD} Vybraný symptom:", symptom, "(ID:", id, ")");

        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.includes(symptom)
                ? prevState.selectedSymptoms
                : [...prevState.selectedSymptoms, symptom];

            const updatedTypes = {
                ...prevState.symptomTypes,
                [symptom]: type,
            };

            localStorage.setItem("symptomTypes", JSON.stringify(updatedTypes));
            localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));

            return {
                selectedSymptoms: updatedSymptoms,
                symptomTypes: updatedTypes,
                hasPainSymptom: updatedSymptoms.some(s => updatedTypes[s] === "bolest"),
            };
        });
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0 || this.state.similarAround === "") return;

        localStorage.setItem("symptomNearbyOption", this.state.similarAround);

        let answers: any[] = [];
        try {
            const stored = localStorage.getItem("patientAnswers");
            answers = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(answers)) answers = [];
        } catch (e) {
            answers = [];
        }

        const symptomEntry = { symptoms: this.state.selectedSymptoms };
        const similarAroundEntry = { similarAround: this.state.similarAround };

        answers = answers.filter(entry => !entry.hasOwnProperty("symptoms"));
        answers.push(symptomEntry);

        answers = answers.filter(entry => !entry.hasOwnProperty("similarAround"));
        answers.push(similarAroundEntry);

        localStorage.setItem("patientAnswers", JSON.stringify(answers));

        const types = this.state.symptomTypes;
        const selected = this.state.selectedSymptoms;
        const hasPain = selected.some(sym => types[sym] === "bolest");
        const onlyOne = selected.length === 1;

        const nextSection = hasPain
            ? PainCheckSection.defaultView
            : onlyOne
                ? MainConditionSection.defaultView
                : MainSymptomSection.defaultView;

        this.props.dispatch(new SwitchViewAction(nextSection));
    };

    performSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        const symptom = e.target.value.trim();
        if (typeof this.state.searchTimeout !== "undefined") clearTimeout(this.state.searchTimeout);

        this.setState({ errorText: "", searchString: symptom });

        if (symptom === "") return this.setState({ userSearch: [] });
        const lang = localStorage.getItem("language") || "cz";

        const timeout = window.setTimeout(() => {
            Axios.get("/symptoms/info", {
                params: {
                    symptom: symptom + "%",
                    role: this.props.searchRole === EnumRole.PATIENT,
                    lang: lang
                },
                method: "GET",
                headers: { Authorization: "Bearer " + this.props.loginData.token }
            }).then((response) => {
                const results = Array.isArray(response.data) ? response.data : [];
                this.setState({
                    userSearch: results,
                    errorText: results.length === 0 ? t("error_symptom_search") : ""
                });
            }).catch(() => {
                this.setState({ errorText: t("error_symptom_search") });
            });
        }, 350);

        this.setState({ searchTimeout: timeout });
    };

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container" id="symptom-input">
                    <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
                    <div className="progress-bar-wrapper">
                        <div className="progress-bar">
                            <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                        </div>
                        <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                    </div>

                    <h2>{t("what_symptom_bothers_you")}</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input
                                type="text"
                                value={this.state.searchString || ""}
                                onChange={this.performSearch}
                                placeholder={t("select_symptom_placeholder")}
                            />
                        </HBox>

                        {this.state.errorText && <div className="hs-userbox-error">{this.state.errorText}</div>}

                        {this.state.searchString && (
                            <div className="scrollable-results">
                                <table className="hs-userbox-table">
                                    <tbody>
                                        {this.state.userSearch?.map(result => (
                                            <tr className="hs-userbox-result" key={result.id}>
                                                <td className="hs-userbox-result-name">{result.symptom}</td>
                                                <td className="hs-userbox-controls">
                                                    <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => this.handleSelectSymptom(result)}>
                                                        {t("select")}
                                                    </HButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </VBox>

                    <div className="selected-symptoms-container">
                        <h3>{t("currently_experiencing_symptoms")}</h3>
                        <div className="scrollable-selected-symptoms">
                            <ul className="selected-symptoms-list">
                                {this.state.selectedSymptoms.map((symptom, index) => (
                                    <li key={index}>
                                        • {symptom} <span className="delete-symptom" onClick={() => this.removeSymptom(symptom)}>🗑️ {t("delete")}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <h3>{t("similar_symptoms_around_you")}</h3>
                    <div className="symptom-nearby-options">
                        {["Yes", "No"].map((option) => (
                            <span
                                key={option}
                                className={`symptomNearbyOption ${this.state.similarAround === option ? "selected" : ""}`}
                                onClick={() => this.setState({ similarAround: option }, () => {
                                    localStorage.setItem("symptomNearbyOption", option);
                                })}
                            >
                                {t(`option_${option.toLowerCase()}`)}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button className="button-next" onClick={this.saveSymptomAndProceed}>{t("button_next")}</button>
                    </div>
                </div>
            </div>
        );
    }
}

const HPatientSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: HPatientWelcomeView,
};

export { HPatientSection };
