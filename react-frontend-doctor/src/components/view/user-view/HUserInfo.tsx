import { HView, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { HForm, HFormComponent } from "../../HForm";
import {
    IAPIReadableResponse,
    IAPIResponse,
    IExtendedUserData,
    ILoginData,
    IUserData,
    RoleToNameMap
} from "../../../data/UserData";
import { HFlow } from "../../HInput";
import { HCard, HHeader, VBox } from "../../HCard";
import { HButton, HButtonStyle } from "../../HButton";
import { Dispatch } from "redux";
import Axios from "axios";
import { EnumInternalState } from "../../../data/AppState";
import { UpdateManagedUserAction, UpdateSelfUserAction } from "../../../data/AppAction";

const HAnamnesisPanel = ({ text }: { text: string }) => (
    <div style={{
        backgroundColor: "#f9f9f9",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        width: "100%",
        whiteSpace: "pre-wrap",
        fontSize: "15px",
        fontFamily: "monospace",
        lineHeight: "1.6"
    }}>
        {text}
    </div>
);

interface HUserProfileProps {
    user?: IUserData;
    userData?: IExtendedUserData;
    editor: ILoginData;
    editAllowed?: boolean;
    dispatch: Dispatch;
}

class HUserProfile extends HFormComponent<HUserProfileProps, {
    yourProfile: boolean,
    loaded: number,
    editMode: boolean,
    anamnesis?: string,
    fields: {
        id: string,
        login: string,
        name: string,
        surname: string,
        role: string,
        birthDate: string,
        birthID: string,
        email: string,
        phone: string
    },
    errorText?: string
}> {
    constructor(props: HUserProfileProps) {
        super(props);

        if (this.props.userData) {
            this.state = {
                yourProfile: this.props.userData.id === this.props.editor.id,
                loaded: 0,
                editMode: false,
                anamnesis: undefined,
                fields: {
                    ...this.props.userData,
                    role: RoleToNameMap[this.props.userData.role],
                    id: this.props.userData.id.toString()
                }
            };
        } else {
            this.state = {
                yourProfile: this.props.user ? (this.props.user.id === this.props.editor.id) : true,
                loaded: 0,
                editMode: false,
                anamnesis: undefined,
                fields: {
                    id: "",
                    login: "",
                    name: "",
                    surname: "",
                    role: "",
                    birthDate: "",
                    birthID: "",
                    email: "",
                    phone: ""
                }
            };
        }
    }

    componentDidMount() {
        const patientId = parseInt(this.state.fields.id);
        if (!isNaN(patientId)) {
            this.loadLatestAnamnesis(patientId);
        }
    }

    loadLatestAnamnesis = (patientId: number): void => {
        Axios.get(`/patients/${patientId}/latest-anamnesis`, {
            headers: {
                Authorization: "Bearer " + this.props.editor.token
            }
        })
        .then((response) => {
            if (response.data && response.data.anamnesis) {
                this.setState({ anamnesis: response.data.anamnesis });
            } else {
                this.setState({ anamnesis: "Žádná anamnéza zatím nebyla vygenerována." });
            }
        })
        .catch(() => {
            this.setState({ anamnesis: "Nepodařilo se načíst anamnézu." });
        });
    }

    retrieveData = (user: IUserData): void => {
        this.setState({ errorText: "" });

        const uid = user.id === this.props.editor.id ? "@self" : user.id;

        Axios.get(`/users/${uid}/profile-detail`, {
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": "Bearer " + this.props.editor.token
            }
        }).then((response) => {
            const apiResponse = response.data as IAPIResponse;

            switch (apiResponse.code) {
                case 200: {
                    const results = apiResponse as IExtendedUserData;
                    this.setState(state => ({
                        loaded: state.loaded + 1,
                        fields: {
                            ...results,
                            role: RoleToNameMap[results.role],
                            id: results.id.toString()
                        }
                    }));
                    break;
                }
                default:
                    if ((apiResponse as IAPIReadableResponse).humanReadableMessage)
                        this.setState({ errorText: `Chyba při vyhledávání: ${(apiResponse as IAPIReadableResponse).humanReadableMessage}` });
                    else
                        this.setState({ errorText: "Došlo k chybě při vyhledávání, prosím zkuste to znovu později." });
            }
        }).catch(() => {
            this.setState({ errorText: "Došlo k chybě při vyhledávání, prosím zkuste to znovu později." });
        });
    }

    toggleProfileEdit = (): void => {
        this.setState(state => ({ editMode: !state.editMode }));
    }

    updateProfile = (): void => {
        this.setState({ errorText: "" });

        const inputID = parseInt(this.state.fields.id);
        const uid = inputID === this.props.editor.id ? "@self" : inputID;

        Axios({
            url: `/users/${uid}/profile-update`,
            method: "PATCH",
            data: {
                "name": this.state.fields.name,
                "surname": this.state.fields.surname,
                "birthDate": this.state.fields.birthDate,
                "birthID": this.state.fields.birthID,
                "email": this.state.fields.email,
                "phone": this.state.fields.phone
            },
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": "Bearer " + this.props.editor.token
            }
        }).then((response) => {
            const apiResponse = response.data as IAPIResponse;
            switch (apiResponse.code) {
                case 200:
                    this.setState({ editMode: false });
                    if (this.state.yourProfile) {
                        this.props.dispatch(new UpdateSelfUserAction({ ...this.state.fields, id: this.props.editor.id, role: this.props.editor.role }));
                    } else {
                        const userData = this.props.userData ?? (this.props.user as IUserData);
                        this.props.dispatch(new UpdateManagedUserAction({ ...this.state.fields, id: userData.id, role: userData.role }));
                    }
                    break;
                default:
                    if ((apiResponse as IAPIReadableResponse).humanReadableMessage)
                        this.setState({ errorText: `Chyba při vyhledávání: ${(apiResponse as IAPIReadableResponse).humanReadableMessage}` });
                    else
                        this.setState({ errorText: "Došlo k chybě při ukládání profilu, prosím zkuste to znovu později." });
            }
        }).catch(() => {
            this.setState({ errorText: "Došlo k chybě při ukládání profilu, prosím zkuste to znovu později." });
        });
    }

    render() {
        return (
            <HCard>
                <HForm key={this.state.loaded + (this.state.editMode ? 1 : 0)} onSubmit={this.updateProfile}>
                    <VBox>
                        <VBox>
                            <HHeader>
                                <HFlow>
                                    {this.state.yourProfile ? "Váš profil" : `Profil uživatele ${this.state.fields.name} ${this.state.fields.surname}`}
                                </HFlow>
                            </HHeader>
                            <HFlow>
                                <HAnamnesisPanel text={this.state.anamnesis ?? "Načítání..."} />
                            </HFlow>
                            <HFlow>
                                <span style={{ color: "red" }}>
                                    {this.state.errorText}
                                </span>
                            </HFlow>
                        </VBox>
                        {this.props.editAllowed ? (
                            <HFlow right={true}>
                                <span style={{ visibility: (this.state.editMode ? "visible" : "hidden") }}>
                                    <HButton buttonStyle={HButtonStyle.TEXT} action={"reset"} action2={this.toggleProfileEdit}>
                                        Zrušit změny
                                    </HButton>
                                </span>
                                <HButton buttonStyle={HButtonStyle.TEXT_INVERTED} action={this.state.editMode ? "submit" : this.toggleProfileEdit}>
                                    {this.state.editMode ? "Uložit změny" : "Upravit profil"}
                                </HButton>
                            </HFlow>
                        ) : null}
                    </VBox>
                </HForm>
            </HCard>
        );
    }
}

export class HSelfProfileView<T extends ISectionProps> extends HView<T> {
    constructor(props: T) {
        super(props);
    }

    render(): ReactNode {
        return (
            <HUserProfile user={this.props.loginData} dispatch={this.props.dispatch} editor={this.props.loginData} editAllowed={true} />
        );
    }
}

export class HOtherProfileView<T extends ISectionProps> extends HView<T> {
    constructor(props: T) {
        super(props);
    }

    requiresUserManagement = (): boolean => true;

    render(): ReactNode {
        if (this.props.managedUser) {
            const allowEdits = (this.props.sectionState.internalState === EnumInternalState.ADMIN_PANEL) || (this.props.loginData.id === this.props.managedUser?.id);
            return (
                <HUserProfile userData={this.props.managedUser} dispatch={this.props.dispatch} editor={this.props.loginData} editAllowed={allowEdits} />
            );
        } else {
            return (
                <HHeader>
                    Pro zobrazení informací prosím nejdříve vyberte uživatele.
                </HHeader>
            );
        }
    }
}
