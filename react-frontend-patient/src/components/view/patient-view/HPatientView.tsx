import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode, ChangeEvent } from "react";
import "../../../style/patient-quiz.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { HBox, VBox } from "../../HCard";
import Axios from "axios";
import { HButton, HButtonStyle } from "../../HButton";
import { EnumRole } from "../../../data/UserData";
import { GynecologySection } from "./GynecologyView";
import { PainCheckSection } from "./PainView";
import { MainConditionSection } from "./ConditionView";

export abstract class HPatientView<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class HPatientWelcomeView<T extends ISectionProps> extends HPatientView<T> {
    constructor(props: T) {
        super(props);
        this.state = {
            selectedSymptoms: [],
            symptomTypes: {},
            hasPainSymptom: false,
            searchString: "",
            userSearch: [],
            errorText: "",
            similarAround: ""
        };
    }

    handleBackClick = (): void => {
        this.setState((prevState) => {
            if (prevState.selectedSymptoms.length === 0) return prevState;

            const updatedSymptoms = [...prevState.selectedSymptoms];
            updatedSymptoms.pop();
            localStorage.setItem("selectedSymptoms", JSON.stringify(updatedSymptoms));

            return { selectedSymptoms: updatedSymptoms };
        }, () => {
            this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
        });
    };

    removeSymptom = (symptomToRemove: string): void => {
        this.setState(prevState => ({
            selectedSymptoms: prevState.selectedSymptoms.filter(symptom => symptom !== symptomToRemove)
        }));
    };

    handleSelectSymptom = (symptom: string) => {
        const selected = this.state.userSearch.find((s: any) => s.symptom === symptom);
        const symptomType = selected?.type || "";
        const isPain = symptomType === "bolest";

        this.setState((prevState) => {
            const updatedSymptoms = prevState.selectedSymptoms.includes(symptom)
                ? prevState.selectedSymptoms
                : [...prevState.selectedSymptoms, symptom];

            const updatedTypes = {
                ...prevState.symptomTypes,
                [symptom]: symptomType,
            };

            return {
                selectedSymptoms: updatedSymptoms,
                symptomTypes: updatedTypes,
                hasPainSymptom: prevState.hasPainSymptom || isPain,
                searchString: "",
                userSearch: [],
            };
        }, () => {
            localStorage.setItem("selectedSymptoms", JSON.stringify(this.state.selectedSymptoms));
        });
    };

    saveSymptomAndProceed = (): void => {
        if (this.state.selectedSymptoms.length === 0) {
            console.log("⚠️ No symptoms selected.");
            return;
        }
    
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    
        const symptomEntry = { symptoms: this.state.selectedSymptoms };
        const similarAroundEntry = { similarAround: this.state.similarAround };
    
        const entriesToSave = [symptomEntry, similarAroundEntry];
    
        for (const entry of entriesToSave) {
            const alreadyExists = answers.some(a => JSON.stringify(a) === JSON.stringify(entry));
            if (!alreadyExists) {
                answers.push(entry);
            }
        }
    
        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("📦 Updated patientAnswers:", answers);
    
        const nextSection = this.state.hasPainSymptom
            ? PainCheckSection.defaultView
            : MainConditionSection.defaultView;
    
        this.props.dispatch(new SwitchViewAction(nextSection));
    };    

    performSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        const symptom = e.target.value.trim();
        if (typeof this.state.searchTimeout !== "undefined") clearTimeout(this.state.searchTimeout);

        this.setState(() => ({ errorText: "", searchString: symptom }));

        if (symptom === "") {
            this.setState(() => ({ userSearch: [] }));
            return;
        }

        const timeout = window.setTimeout(() => {
            Axios.get("/symptoms/info", {
                params: { symptom: symptom, role: this.props.searchRole === EnumRole.PATIENT },
                method: "GET",
                headers: { Authorization: "Bearer " + this.props.loginData.token }
            }).then((response) => {
                if (Array.isArray(response.data)) {
                    this.setState(() => ({ userSearch: response.data }));
                } else {
                    this.setState(() => ({ errorText: "Unexpected API response format." }));
                }
            }).catch(() => {
                this.setState(() => ({ errorText: "Došlo k chybě při vyhledávání, prosím zkuste to znovu později." }));
            });
        }, 350);

        this.setState({ searchTimeout: timeout });
    };

    render(): ReactNode {
        return (
            <div className="patient-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="patient-container" id="symptom-input">
                    <div className="progress-bar">
                        <div className="completed"></div>
                        <div className="in-progress"></div>
                        <div className="pending"></div>
                    </div>

                    <h2>What symptom bothers you the most?</h2>
                    <VBox className="scrollable-search-container">
                        <HBox>
                            <input 
                                type="text"
                                value={this.state.searchString || ""} 
                                onChange={this.performSearch} 
                                placeholder="Vyberte symptom..."
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
                                                    <HButton buttonStyle={HButtonStyle.TEXT_SYMPTOM} action={() => this.handleSelectSymptom(result.symptom)}>
                                                        Vybrat
                                                    </HButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </VBox>

                    <div className="tags">
                        <span>My stomach hurts</span>
                        <span>Fever</span>
                        <span>Tired</span>
                        <span>Headache</span>
                        <span>Sore throat</span>
                        <span>Nausea</span>
                    </div>

                    <div className="selected-symptoms-container">
                        <h3>You are currently experiencing this symptoms?</h3>
                        <div className="scrollable-selected-symptoms">
                            <ul className="selected-symptoms-list">
                                {this.state.selectedSymptoms.map((symptom, index) => (
                                    <li key={index}>
                                        • {symptom} <span className="delete-symptom" onClick={() => this.removeSymptom(symptom)}>🗑️ delete</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <h3>Does anyone around you have similar symptoms?</h3>
                    <div className="symptom-nearby-options">
                        {["Yes", "No"].map((option) => (
                            <span
                                key={option}
                                className={`symptomNearbyOption ${this.state.similarAround === option ? "selected" : ""}`}
                                onClick={() => this.setState({ similarAround: option })}
                            >
                                {option}
                            </span>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button className="button" onClick={this.saveSymptomAndProceed}>Next</button>
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
