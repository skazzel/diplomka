import { EnumRole, IExtendedUserData, ILoginData, IUserData } from "./UserData";
import { HView, IHSection } from "../components/view/HView";
import { HPatientSection } from "../components/view/patient-view/HPatientView";
import { BodyImageSection } from "../components/view/patient-view/BodyImage";
import { GenderInfoSection } from "../components/view/patient-view/GenderView";

export enum LoginState {
    LOGGED_IN = "LOGGED_IN",
    LOGGED_OUT = "LOGGED_OUT"
}

export enum SectionType {
    LOGIN_SCREEN = "LOGIN_SCREEN",
    INTERNAL_SCREEN = "INTERNAL_SCREEN",
}

export interface IApplicationSection {
    sectionType: SectionType
}

export interface IApplicationState {
    loginState: LoginState;
    currentSection: IApplicationSection;
}

export class LoginScreenSectionState implements IApplicationSection {
    readonly sectionType: SectionType;

    constructor()
    {
        this.sectionType = SectionType.LOGIN_SCREEN;
    }
}

export enum EnumInternalState {
    PATIENT_PANEL = "PATIENT_PANEL"
}

export interface IInternalApplicationState {
    internalState: EnumInternalState;
    internalSection: IHSection
    currentView: typeof HView
}

export function internalAppStateFromRole(role: EnumRole): IInternalApplicationState
{
    switch (role)
    {
        case EnumRole.PATIENT:
            return {
                internalState: EnumInternalState.PATIENT_PANEL,
                internalSection: GenderInfoSection, // ✅ This should be correct
                currentView: GenderInfoSection.defaultView // ✅ Ensure this is correctly set
            };
    }
}

export class InternalScreenSectionState implements IApplicationSection {
    readonly sectionType: SectionType;
    readonly loginData: ILoginData;
    readonly sectionState: IInternalApplicationState;
    readonly managedUser?: IExtendedUserData;

    constructor(loginData: ILoginData, sectionState?: IInternalApplicationState, managedUser?: IExtendedUserData)
    {
        this.sectionType = SectionType.INTERNAL_SCREEN;
        this.loginData = loginData;
        this.managedUser = managedUser;
        this.sectionState = sectionState ?? internalAppStateFromRole(loginData.role);
    }
}

const mockLoginData: ILoginData = {
    token: "demo-token",
    role: EnumRole.PATIENT,
    id: "@self"
};

const applicationStateDefault: IApplicationState = {
    loginState: LoginState.LOGGED_IN,
    currentSection: new InternalScreenSectionState(mockLoginData, {
        internalState: EnumInternalState.PATIENT_PANEL,
        internalSection: GenderInfoSection,
        currentView: GenderInfoSection.defaultView
    })
};

export  { applicationStateDefault };