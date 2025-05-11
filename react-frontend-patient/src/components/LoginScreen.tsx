import React, { ReactNode } from "react";
import { LoginScreenSectionState } from "../data/AppState";
import { Dispatch } from "redux";
import { LoginAction } from "../data/AppAction";
import Axios from "axios";
import { IAPIResponse, ILoginData } from "../data/UserData";

export class LoginScreen extends React.Component<{
    dispatch: Dispatch,
    sectionState: LoginScreenSectionState
}, {
    errorText?: string
}> {
    constructor(props: never) {
        super(props);
        this.state = {
            errorText: ""
        };
    }

    componentDidMount(): void {
        this.autoLogin();
    }

    autoLogin = (): void => {
        Axios({
            url: "/users/login",
            method: "POST",
            data: {
                username: "petr",
                password: "petr11"
            }
        }).then((response) => {
            const apiResponse = response.data as IAPIResponse;

            if (apiResponse.code === 200) {
                const responseData = apiResponse as ILoginData;
                this.props.dispatch(new LoginAction(responseData));
                console.log("✅ Auto login success");
            } else {
                this.setState({
                    errorText: `❌ Chyba: ${(apiResponse as any).humanReadableMessage || "neznámá chyba"}`
                });
            }
        }).catch(() => {
            this.setState({
                errorText: "❌ Došlo k chybě při přihlašování, zkuste to prosím znovu později."
            });
        });
    };

    render(): ReactNode {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontFamily: "sans-serif"
            }}>
                <div>
                    <h2>Přihlašuji uživatele <strong>petr</strong>...</h2>
                    {this.state.errorText && <p style={{ color: "red" }}>{this.state.errorText}</p>}
                </div>
            </div>
        );
    }
}
