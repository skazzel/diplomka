import React, { ReactNode } from "react";
import { EnumInternalState, internalAppStateFromRole, InternalScreenSectionState } from "../data/AppState";
import { Dispatch } from "redux";
import { LogoutAction, SwitchManagedUserAction, SwitchSectionAction, SwitchViewAction } from "../data/AppAction";
import watermarkLogo from "../img/znak.png";


import "../style/h-internal-shared.less";

import accountCircleIcon from "../img/account_circle-white-18dp.svg";
import closeIcon from "../img/close-white-18dp.svg";
import appsIcon from "../img/apps-white-18dp.svg";
import logo from "../img/images.png"

import { HClockDate, HClockTime } from "./HClock";
import { HView } from "./view/HView";
import { HOtherProfileView, HSelfProfileView } from "./view/user-view/HUserInfo";
import {
    EnumRole,
    IAPIReadableResponse,
    IAPIResponse,
    IExtendedUserData,
    IUserSearchResult,
    RoleToNameMap
} from "../data/UserData";
import { HUserSearchBox } from "./HUserSearchBox";
import { HSubHeader, VBox } from "./HCard";
import Axios from "axios";


export class InternalAppScreen extends React.Component<{
    dispatch: Dispatch,
    currentView: typeof HView,
    sectionState: InternalScreenSectionState
}, {
    userManagementEnabled: boolean,
    errorText?: string
}> {
    constructor(props: never)
    {
        super(props);

        this.state = {
            userManagementEnabled: false
        };
    }

    chooseUser = (result: IUserSearchResult | null): void => {
        if (result === null)
        {
            this.props.dispatch(new SwitchManagedUserAction(null));
            return;
        }

        const uid = result.id === this.props.sectionState.loginData.id ? "@self" : result.id;

        Axios.get(`/users/${uid}/profile-detail`,
            {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "Authorization": "Bearer " + this.props.sectionState.loginData.token
                }
            }
        ).then((response) => {
            const apiResponse = response.data as IAPIResponse;

            switch (apiResponse.code)
            {
                case 200:
                {
                    const results = apiResponse as IExtendedUserData;
                    this.props.dispatch(new SwitchManagedUserAction(results));
                    break;
                }

                default:
                    this.setState(() => ({
                        errorText: `Chyba při zpracování požadavku: ${(apiResponse as IAPIReadableResponse).humanReadableMessage}`
                    }));
            }
        }).catch(() => {
            this.setState(() => ({
                errorText: "Došlo k chybě při zpracování požadavku, prosím zkuste to znovu později."
            }));
        });
    }

    viewUser = (result: { id: number, anamnesis: string }): void => {
        // Neposílej request na profile-detail
        this.props.dispatch(new SwitchManagedUserAction({
            id: result.id,
            name: "Pacient",
            surname: `#${result.id}`,
            birthDate: "",
            birthID: "",
            email: "",
            phone: "",
            login: "",
            role: 0 // Nebo EnumRole.PATIENT
        }));
        this.props.dispatch(new SwitchViewAction(HOtherProfileView));
    }
    
    logout = (): void => {
        this.props.dispatch(new LogoutAction());
    }

    render(): ReactNode
    {
        const ViewComponentType = this.props.currentView;

        const viewComponent = <ViewComponentType
            key={ this.props.sectionState.managedUser?.id }
            dispatch={ this.props.dispatch }
            loginData={ this.props.sectionState.loginData }
            sectionState={ this.props.sectionState.sectionState }
            managedUser={ this.props.sectionState.managedUser }
            requiresUserManagementCallback={ enabled => this.setState({
                userManagementEnabled: enabled
            })} />;

        let sectionChooser: ReactNode | null = null;

        const role = this.props.sectionState.loginData.role;
        let renderMenu = null;
        let renderSide = null;

        if (role !== EnumRole.PATIENT)
        {
            renderSide = (
                <div></div>
                /*<div id="hs-app-menu">
                <ul>
                    {
                        this.props.sectionState.sectionState.internalSection.menuItems.map(menuItem => (
                            <li key={ menuItem.name }>
                                <a href="#" onClick={ () => this.props.dispatch(new SwitchViewAction(menuItem.targetView)) }>
                                    <img src={ menuItem.icon } alt={ menuItem.name } />
                                    <span className="hs-app-menu-label">
                                        { menuItem.name }
                                    </span>
                                </a>
                            </li>
                        ))
                    }
                </ul>
            </div>*/
            );
            renderMenu = (
                <div>
                    <div id="hs-menu">
                        <ul>
                            <li className="hs-menu-option">
                                <span className="hs-menu-current-entity">
                                    <div className="hs-menu-current-container">
                                    <img src={logo} alt="FN Olomouc Logo" className="logo" />
                                    </div>
                                </span>
                            </li>
        
                            <li className="hs-menu-free-space">
                            </li>
        
                            {
                                sectionChooser
                            }
        
                            <li className="hs-menu-option">
                                <a href="#" onClick={ () => this.props.dispatch(new SwitchViewAction(HSelfProfileView)) }>
                                    <div className="hs-menu-option-img">
                                        <img src={ accountCircleIcon } alt="<account>" />
                                    </div>
                                    <div className="hs-menu-option-text">
                                        { this.props.sectionState.loginData.name } { this.props.sectionState.loginData.surname }
                                    </div>
                                </a>
                            </li>
                            <li className="hs-menu-option">
                                <a href="#" onClick={ this.logout }>
                                    <div className="hs-menu-option-img">
                                        <img src={ closeIcon } alt="<logout>" />
                                    </div>
                                    <div className="hs-menu-option-text">
                                        Odhlásit
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            );
        }

        return (
            <div id="hs-wrapper">
                {renderMenu}
                <div id="hs-app-container">
                    {renderSide}
                    <div id="hs-app-viewport">
                        {
                            this.state.errorText ? (
                                <HSubHeader>
                                    { this.state.errorText }
                                </HSubHeader>
                            ) : null
                        }
                        {
                            this.state.userManagementEnabled ? (
                                <HUserSearchBox
                                    chooseUserCallback={ this.chooseUser }
                                    viewUserCallback={ this.viewUser }
                                    loginData={ this.props.sectionState.loginData }
                                />
                            ) : undefined
                        }

                        <div id="hs-app-viewport-inner">
                            {
                                viewComponent
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}