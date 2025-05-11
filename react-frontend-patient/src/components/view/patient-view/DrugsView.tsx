import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/drugs.less";
import { SwitchViewAction } from "../../../data/AppAction";
import { MainSymptomSection } from "./MainSymptom";
import { PharmacologySection } from "./PharmacologyView";

export abstract class Drugs<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class DrugsView<T extends ISectionProps> extends Drugs<T> {
    constructor(props: T) {
        super(props);
        const stored = JSON.parse(localStorage.getItem("drugsData") || "{}");
        this.state = {
            status: stored.status || "",
            drugName: stored.drugName || "",
            durationValue: stored.durationValue || "",
            durationUnit: stored.durationUnit || "months",
            quitDurationValue: stored.quitDurationValue || "",
            quitDurationUnit: stored.quitDurationUnit || "months",
            quitDate: stored.quitDate || "",
        };
    }

    componentDidUpdate(): void {
        localStorage.setItem("drugsData", JSON.stringify(this.state));
    }

    handleOptionSelect = (option: string) => {
        this.setState({ status: option });
    };

    handleBackClick = (): void => {
        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
        const filteredAnswers = answers.filter((entry: any) => !entry.hasOwnProperty("badHabits"));
        localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
        this.props.dispatch(new SwitchViewAction(require("./BadHabbits").BadHabbitsSection.defaultView));
    };

    handleNext = () => {
        const { status, drugName, durationValue, durationUnit, quitDurationValue, quitDurationUnit, quitDate } = this.state;

        const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

        const entry = {
            drugs: {
                status,
                ...(status === "yes" && {
                    drugName,
                    howLong: `${durationValue} ${durationUnit}`
                }),
                ...(status === "quit" && {
                    drugName,
                    howLong: `${quitDurationValue} ${quitDurationUnit}`,
                    quitDate
                })
            }
        };

        const existingIndex = answers.findIndex((a: any) => a.hasOwnProperty("drugs"));
        if (existingIndex !== -1) {
            answers[existingIndex] = entry;
        } else {
            answers.push(entry);
        }

        localStorage.setItem("patientAnswers", JSON.stringify(answers));
        console.log("\uD83D\uDCBE Saved drug answers:", answers);

        this.props.dispatch(new SwitchViewAction(PharmacologySection.defaultView));
    };

    render(): ReactNode {
        const { status, durationUnit, quitDurationUnit } = this.state;

        const unitOptions = ["days", "weeks", "months", "years"];

        return (
            <div className="drugs-view">
                <button className="back-button" onClick={this.handleBackClick}>← Back</button>

                <div className="progress-bar">
                    <div className="completed"></div>
                    <div className="in-progress"></div>
                    <div className="pending"></div>
                </div>

                <h2>Have you ever used drugs?</h2>
                <div className="button-group">
                    {["yes", "no", "quit"].map(option => (
                        <button
                            key={option}
                            className={`answer-button ${this.state.status === option ? "selected" : ""}`}
                            onClick={() => this.handleOptionSelect(option)}
                        >
                            {option === "yes" && "Yes"}
                            {option === "no" && "No"}
                            {option === "quit" && "I used to"}
                        </button>
                    ))}
                </div>

                {(status === "yes" || status === "quit") && (
                    <>
                        <h3>What kind of drug? <span className="optional">(optional)</span></h3>
                        <input
                            type="text"
                            placeholder="e.g., Marijuana"
                            value={this.state.drugName}
                            onChange={e => this.setState({ drugName: e.target.value })}
                        />

                        <h3>How long did you use it?</h3>
                        <div className="duration-group">
                            <input
                                type="number"
                                min="0"
                                value={status === "yes" ? this.state.durationValue : this.state.quitDurationValue}
                                onChange={e =>
                                    this.setState({
                                        [status === "yes" ? "durationValue" : "quitDurationValue"]: e.target.value
                                    })
                                }
                            />
                            <select
                                value={status === "yes" ? durationUnit : quitDurationUnit}
                                onChange={e =>
                                    this.setState({
                                        [status === "yes" ? "durationUnit" : "quitDurationUnit"]: e.target.value
                                    })
                                }
                            >
                                {unitOptions.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {status === "quit" && (
                    <>
                        <h3>When did you quit?</h3>
                        <input
                            type="date"
                            value={this.state.quitDate}
                            onChange={e => this.setState({ quitDate: e.target.value })}
                        />
                    </>
                )}

                <div style={{ marginTop: "20px" }}>
                    <button className="button" onClick={this.handleNext}>Next</button>
                </div>
            </div>
        );
    }
}

const DrugsSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: DrugsView,
};

export { DrugsSection };
