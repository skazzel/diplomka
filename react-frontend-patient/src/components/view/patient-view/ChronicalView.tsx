import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/chronical.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { HBox, VBox } from "../../HCard";
import { HButton, HButtonStyle } from "../../HButton";
import Axios from "axios";
import { EnumRole } from "../../../data/UserData";
import { MainConditionSection } from "./ConditionView";
import { ChronicalSinceSection } from "./chronicSince";
import { SurgeryTypeSection } from "./operationView";

export abstract class Chronical<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class ChronicalView<T extends ISectionProps> extends Chronical<T> {
    constructor(props: T) {
        super(props);
        const stored = JSON.parse(localStorage.getItem("selectedDiseases") || "[]");
        const validDiseases = Array.isArray(stored) ? stored.filter(d => typeof d === "string" && d.trim() !== "") : [];

        this.state = {
            selectedDiseases: validDiseases,
            searchString: "",
            userSearch: [],
            errorText: ""
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
            this.setState({ userSearch: [] });
            return;
        }

        Axios.get("/diseases/info", {
            params: {
                disease: value + "%",
                role: this.props.searchRole === EnumRole.PATIENT
            },
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        })
        .then((res) => {
            if (Array.isArray(res.data)) {
                this.setState({ userSearch: res.data });
            }
        })
        .catch(() => {
            this.setState({ errorText: "Chyba při vyhledávání." });
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

        const isNone = diseases.length === 1 && diseases[0] === "None";
        const nextSection = isNone ? SurgeryTypeSection.defaultView : ChronicalSinceSection.defaultView;

        this.props.dispatch(new SwitchViewAction(nextSection));
    };

    handleNext = () => this.saveAndProceed(this.state.selectedDiseases);

    handleNoChronic = () => this.saveAndProceed(["None"]);

    render(): ReactNode {
        return (
            <div className="chronical-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>

                <div className="progress-bar">
                    <div className="completed"></div>
                    <div className="in-progress"></div>
                    <div className="pending"></div>
                </div>

                <h2>Do you suffer from any chronic disease?</h2>
                <VBox className="scrollable-search-container">
                    <HBox>
                        <input
                            type="text"
                            value={this.state.searchString}
                            onChange={this.performSearch}
                            placeholder="Search for chronic condition..."
                        />
                    </HBox>

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
                                            Vybrat
                                        </HButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </VBox>

                <div className="selected-symptoms-container">
                    <h3>Selected conditions:</h3>
                    <ul className="selected-symptoms-list">
                        {this.state.selectedDiseases.map((disease, index) => (
                            <li key={index}>
                                • {disease}
                                <span className="delete-symptom" onClick={() => this.removeSymptom(disease)}>🗑️ delete</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="surgery-buttons-row">
                    <button className="button" onClick={this.handleNext}>Next</button>
                    <button className="button no-surgery" onClick={this.handleNoChronic}>Nemám žádné chronické nemoci</button>
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
