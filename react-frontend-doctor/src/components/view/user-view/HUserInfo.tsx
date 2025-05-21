import { HView, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { HCard, HHeader, VBox, HBox } from "../../HCard";
import { HFormComponent } from "../../HForm";
import { ILoginData } from "../../../data/UserData";
import Axios from "axios";
import "../../../style/anamnesis_container.less";

interface AnamnesisRecord {
    patient_id: number;
    content: string;
    created: string;
}

interface HUserInfoProps extends ISectionProps {
    loginData: ILoginData;
}

interface HUserInfoState {
    anamneses: AnamnesisRecord[];
    errorText?: string;
    birthNumber: string;
    selectedContent: string;
}

export class HUserInfo extends HFormComponent<HUserInfoProps, HUserInfoState> {
    constructor(props: HUserInfoProps) {
        super(props);

        const birthNumber = localStorage.getItem("hospitu_birthNumber") || "";
        console.log("🔍 birthNumber loaded from localStorage:", birthNumber);

        this.state = {
            birthNumber,
            anamneses: [],
            errorText: undefined,
            selectedContent: ""
        };
    }

    componentDidMount(): void {
        if (!this.state.birthNumber) {
            this.setState({ errorText: "Rodné číslo nebylo zadáno." });
            return;
        }

        const encoded = encodeURIComponent(this.state.birthNumber.trim());
        Axios.get(`/patients/by-birth-number/${encoded}/anamneses`, {
            headers: {
                Authorization: "Bearer " + this.props.loginData.token
            }
        })
            .then((response) => {
                if (Array.isArray(response.data)) {
                    this.setState({ anamneses: response.data, errorText: undefined });
                } else {
                    this.setState({ anamneses: [], errorText: "Žádné výsledky." });
                }
            })
            .catch(() => {
                this.setState({ anamneses: [], errorText: "Chyba při načítání anamnéz." });
            });
    }

    render(): ReactNode {
        return (
            <div id="hs-anamnesis-container">
                {/* Levý sloupec – seznam anamnéz */}
                <div className="hs-anamnesis-card">
                    <HHeader>
                        Seznam anamnéz pro rodné číslo: {this.state.birthNumber}
                    </HHeader>
                    {this.state.errorText && (
                        <span style={{ color: "red", marginTop: "10px" }}>
                            {this.state.errorText}
                        </span>
                    )}
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>Datum</th>
                                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.anamneses.map((record, index) => (
                                <tr key={index}>
                                    <td style={{ padding: "8px" }}>{new Date(record.created).toLocaleString()}</td>
                                    <td style={{ padding: "8px" }}>
                                        <a href="#" onClick={() => this.setState({ selectedContent: record.content })}>
                                            Zobrazit
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
    
                {/* Pravý sloupec – detailní výpis vybrané anamnézy */}
                <div className="hs-anamnesis-card">
                    <HHeader>Obsah vybrané anamnézy</HHeader>
                    <textarea
                        value={this.state.selectedContent}
                        readOnly
                        style={{
                            width: "100%",
                            height: "500px",
                            padding: "16px",
                            fontSize: "16px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            resize: "none",
                            whiteSpace: "pre-wrap",
                            overflowY: "auto",
                            boxSizing: "border-box",
                            flexGrow: 1
                        }}
                    />
                </div>
            </div>
        );
    }
    
}

// Kompatibilita
export class HSelfProfileView<T extends ISectionProps> extends HView<T> {
    constructor(props: T) {
        super(props);
    }

    render(): ReactNode {
        return (
            <HUserInfo loginData={this.props.loginData} sectionState={this.props.sectionState} />
        );
    }
}

export class HOtherProfileView<T extends ISectionProps> extends HView<T> {
    constructor(props: T) {
        super(props);
    }

    requiresUserManagement = (): boolean => true;

    render(): ReactNode {
        return (
            <HUserInfo loginData={this.props.loginData} sectionState={this.props.sectionState} />
        );
    }
}
