import React, { ChangeEvent, ReactNode } from "react";
import { ILoginData } from "../data/UserData";
import Axios from "axios";
import { VBox, HBox } from "./HCard";
import { HButton, HButtonStyle } from "./HButton";

import "../style/h-userbox.less";

export class HUserSearchBox extends React.Component<{
    chooseUserCallback: ((result: { id: number } | null) => void),
    viewUserCallback: ((result: { id: number }) => void),
    loginData: ILoginData,
}, {
    searchKey: number,
    errorText?: string,
    searchTimeout?: number,
    searchResults?: { id: number, anamnesis: string }[],
    searchString?: string
}> {
    constructor(props: never) {
        super(props);

        this.state = {
            searchKey: 0
        };
    }

    performSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;

        if (typeof this.state.searchTimeout !== "undefined") {
            clearTimeout(this.state.searchTimeout);
        }

        this.setState({
            errorText: "",
            searchString: value
        });

        if (value === "") {
            this.setState({
                searchResults: []
            });
            return;
        }

        const timeout = window.setTimeout(() => {
            const patientId = parseInt(value);
            if (isNaN(patientId)) {
                this.setState({ errorText: "Zadejte platné ID pacienta." });
                return;
            }

            Axios.get(`/patients/${patientId}/latest-anamnesis`, {
                headers: {
                    "Authorization": "Bearer " + this.props.loginData.token
                }
            })            
            .then((response) => {
                if (response.data?.anamnesis) {
                    this.setState({
                        searchResults: [{ id: patientId, anamnesis: response.data.anamnesis }],
                        errorText: undefined
                    });
                } else {
                    this.setState({
                        searchResults: [{ id: patientId, anamnesis: "Žádná anamnéza zatím nebyla vygenerována." }]
                    });
                }
            })
            .catch(() => {
                this.setState({
                    errorText: "Nepodařilo se načíst anamnézu."
                });
            });
        }, 350);

        this.setState({
            searchTimeout: timeout
        });
    }

    render(): ReactNode {
        return (
            <div id="hs-userbox">
                <div className="hs-userbox-spacer" />
                <div className="hs-userbox-center">
                    <VBox>
                        <HBox>
                            <input key={this.state.searchKey} type="text"
                                defaultValue={this.state.searchString} onClick={event => {
                                    (event.target as HTMLInputElement).value = "";
                                }} onChange={this.performSearch} placeholder="Zadejte ID pacienta..." />
                        </HBox>
                        {this.state.errorText && (
                            <div className="hs-userbox-error">{this.state.errorText}</div>
                        )}
                        {this.state.searchString && this.state.searchResults?.length ? (
                            <table className="hs-userbox-table">
                                <colgroup>
                                    <col className="hs-userbox-col-name" />
                                    <col className="hs-userbox-col-controls" />
                                </colgroup>
                                <tbody>
                                    {this.state.searchResults.map(result => (
                                        <tr className="hs-userbox-result" key={result.id}>
                                            <td className="hs-userbox-result-name">
                                                {result.anamnesis === "Žádná anamnéza zatím nebyla vygenerována." ? (
                                                    <pre style={{ whiteSpace: "pre-wrap" }}>{result.anamnesis}</pre>
                                                ) : (
                                                    <>
                                                        Rodne cislo: {result.id}<br />
                                                    </>
                                                )}
                                            </td>
                                            <td className="hs-userbox-controls">
                                                {result.anamnesis !== "Žádná anamnéza zatím nebyla vygenerována." && (
                                                    <HButton buttonStyle={HButtonStyle.BORDER} action={() => {
                                                        this.setState(state => ({
                                                            searchString: "",
                                                            searchKey: state.searchKey + 1
                                                        }));
                                                        this.props.viewUserCallback({ id: result.id });
                                                    }}>
                                                        Zobrazit informace
                                                    </HButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : null}
                    </VBox>
                </div>
                <div className="hs-userbox-spacer" />
            </div>
        );
    }
    
}
