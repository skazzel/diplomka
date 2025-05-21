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

export abstract class SurgeryType<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class SurgeryTypeView<T extends ISectionProps> extends SurgeryType<T> {
    constructor(props: T) {
        super(props);
        const stored = JSON.parse(localStorage.getItem("selectedSurgeries") || "[]");
        const valid = Array.isArray(stored) ? stored.filter((s) => typeof s === "string" && s.trim() !== "") : [];

        this.state = {
            selectedSurgeries: valid,
            userSearch: [],
            searchString: "",
            errorText: "",
        };
    }

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const chronicalEntry = answers.find((entry: any) => entry.hasOwnProperty("chronicCondition"));
        const isNone = chronicalEntry && Array.isArray(chronicalEntry.chronicCondition) && chronicalEntry.chronicCondition.includes("None");

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
            this.setState({ userSearch: [] });
            return;
        }

        Axios.get("/operations/info", {
            params: {
                operation: keyword + "%",
                role: this.props.searchRole === EnumRole.PATIENT
            },
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        }).then((response) => {
            if (Array.isArray(response.data)) {
                this.setState({ userSearch: response.data });
            }
        }).catch(() => {
            this.setState({ errorText: "Search failed." });
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

    handleNext = () => this.saveAndProceed(this.state.selectedSurgeries);

    handleNoSurgeries = () => this.saveAndProceed(["Neměl jsem žádné operace"]);

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container" id="symptom-input">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress completed"></div>
                        <div className="progress active"></div>
                        <div className="progress pending"></div>
                    </div>
                </div>

                <h2>Have you ever had surgery?</h2>
                <VBox className="scrollable-search-container">
                    <HBox>
                        <input
                            type="text"
                            value={this.state.searchString}
                            onChange={this.performSearch}
                            placeholder="Search for surgery..."
                        />
                    </HBox>

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
                                            Vybrat
                                        </HButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </VBox>

                <div className="selected-symptoms-container">
                    <h3>Selected surgeries:</h3>
                    <ul className="selected-symptoms-list">
                        {this.state.selectedSurgeries.map((s, i) => (
                            <li key={i}>
                                • {s}
                                <span className="delete-symptom" onClick={() => this.removeSurgery(s)}>🗑️ delete</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="buttons-row">
                    <button className="button-next" onClick={this.handleNext}>Next</button>
                    <button className="button-skip" onClick={this.handleNoSurgeries}>
                        Neměl jsem žádné operace
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
