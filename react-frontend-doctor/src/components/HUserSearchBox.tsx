import React, { ChangeEvent, ReactNode } from "react";
import { ILoginData } from "../data/UserData";
import Axios from "axios";
import { InternalScreenSectionState } from "../data/AppState";
import { VBox, HBox } from "./HCard";
import { Dispatch } from "redux";
import { SwitchViewAction } from "../data/AppAction";
import { HUserInfo } from "./view/user-view/HUserInfo";

import "../style/h-userbox.less";

export class HUserSearchBox extends React.Component<{
    chooseUserCallback: ((result: { id: number } | null) => void),
    viewUserCallback: ((result: { id: number }) => void),
    loginData: ILoginData,
    dispatch: Dispatch,
    sectionState: InternalScreenSectionState
}, {
    searchKey: number,
    errorText?: string,
    searchTimeout?: number,
    searchResults?: { id: number, anamnesis: string }[],
    searchString?: string
}> {
    constructor(props: never) {
        super(props);
        this.state = { searchKey: 0 };
    }

    performSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;

        if (this.state.searchTimeout) clearTimeout(this.state.searchTimeout);

        this.setState({ errorText: "", searchString: value });

        if (value === "") {
            this.setState({ searchResults: [] });
            return;
        }

        const timeout = window.setTimeout(() => {
            const encoded = encodeURIComponent(value.trim());

            Axios.get(`/patients/by-birth-number/${encoded}/anamneses`, {
                headers: { "Authorization": "Bearer " + this.props.loginData.token }
            })
            .then((response) => {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    this.setState({
                        searchResults: response.data.map((record: any) => ({
                            id: record.patient_id,
                            anamnesis: record.content || "Žádná anamnéza zatím nebyla vygenerována."
                        })),
                        errorText: undefined
                    });
                } else {
                    this.setState({
                        searchResults: [{ id: -1, anamnesis: "Žádná anamnéza zatím nebyla vygenerována." }]
                    });
                }
            })
            .catch(() => {
                this.setState({ errorText: "Nepodařilo se načíst anamnézu." });
            });
        }, 350);

        this.setState({ searchTimeout: timeout });
    };

    handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter" && this.state.searchString?.trim()) {
            localStorage.setItem("hospitu_birthNumber", this.state.searchString); // ⬅️ uložíme do localStorage
            this.props.dispatch(new SwitchViewAction(HUserInfo)); // přepneme na HUserInfo
            this.setState(state => ({
                searchString: "",
                searchKey: state.searchKey + 1
            }));
        }
    };
    
    render(): ReactNode {
        return (
            <div id="hs-userbox">
                <div className="hs-userbox-spacer" />
                <div className="hs-userbox-center">
                    <VBox>
                        <HBox>
                            <input
                                key={this.state.searchKey}
                                type="text"
                                value={this.state.searchString || ""}
                                onChange={this.performSearch}
                                onKeyDown={this.handleKeyDown}
                                placeholder="Zadejte rodné číslo..."
                                style={{ padding: "10px", fontSize: "16px", width: "100%" }}
                            />
                        </HBox>
                        {this.state.errorText && (
                            <div className="hs-userbox-error">{this.state.errorText}</div>
                        )}
                    </VBox>
                </div>
                <div className="hs-userbox-spacer" />
            </div>
        );
    }
}
