import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom"; // ✅ Import withRouter
import bodyImg from "../../../img/body.svg";
import "../../../style/body-parts.less";
import { Dispatch } from "redux";
import { HPatientSection, HPatientView, HPatientWelcomeView } from "../patient-view/HPatientView";
import { SwitchViewAction } from "../../../data/AppAction"; // ✅ Ensure correct import

// Define types for clicked pain areas
interface HPatientState {
    showErrorMessage: boolean;
    selectedPainAreas: string[];
}

// Abstract class for body image functionality
export abstract class BodyImage<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

// ✅ Extend props to include RouteComponentProps (for navigation)
interface BodyImageProps extends ISectionProps, RouteComponentProps {
    dispatch: Dispatch;
}

class BodyImageView<T extends ISectionProps> extends BodyImage<T & BodyImageProps> {
    constructor(props: T & BodyImageProps) {
        super(props);
        this.state = {
            showErrorMessage: false,
            selectedPainAreas: []
        };
    }

    handleBodyClick = (area: string) => {
        this.setState((prevState: HPatientState) => ({
            selectedPainAreas: prevState.selectedPainAreas.includes(area)
                ? prevState.selectedPainAreas.filter(item => item !== area)
                : [...prevState.selectedPainAreas, area]
        }));
    };

    handleNextClickButton = (): void => {
        console.log("Switching view to HPatientView");
        this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
    };

    render(): ReactNode {
        return (
            <div className="body-view">
                {/* Symptom Selection */}
                <div className="container" id="symptom-input">
                    <h2>Select Where You Feel Pain</h2>
                    <div className="body-map">
                    <img src={bodyImg} alt="Body Map" className="body-image" />
                        <div className="clickable-points">
                            {/* Front Body Dots */}
                            <div className="dot head" onClick={() => this.handleBodyClick("head")}></div>
                            <div className="dot left-ear" onClick={() => this.handleBodyClick("left ear")}></div>
                            <div className="dot chin" onClick={() => this.handleBodyClick("chest")}></div> {/* Chest */}
                            <div className="dot right-ear" onClick={() => this.handleBodyClick("right ear")}></div>
                            <div className="dot neck" onClick={() => this.handleBodyClick("neck")}></div>
                            <div className="left nipple" onClick={() => this.handleBodyClick("left nipple")}></div>
                            <div className="right nipple" onClick={() => this.handleBodyClick("right nipple")}></div>
                            <div className="dot left-shoulder" onClick={() => this.handleBodyClick("left shoulder")}></div>
                            <div className="dot right-shoulder" onClick={() => this.handleBodyClick("right shoulder")}></div>
                            <div className="dot left-arm" onClick={() => this.handleBodyClick("left arm")}></div>
                            <div className="dot right-arm" onClick={() => this.handleBodyClick("right arm")}></div>
                            <div className="dot left-hand" onClick={() => this.handleBodyClick("left hand")}></div>
                            <div className="dot right-hand" onClick={() => this.handleBodyClick("right hard")}></div>
                            <div className="dot chest-left" onClick={() => this.handleBodyClick("left chest")}></div>
                            <div className="dot chest-right" onClick={() => this.handleBodyClick("right chest")}></div>
                            <div className="dot stomach-upper" onClick={() => this.handleBodyClick("upper stomach")}></div>
                            <div className="dot stomach-lower" onClick={() => this.handleBodyClick("lower stomach")}></div>
                            <div className="dot left-hand" onClick={() => this.handleBodyClick("left hand")}></div>
                            <div className="dot right-hand" onClick={() => this.handleBodyClick("right hand")}></div>
                            <div className="dot left-leg" onClick={() => this.handleBodyClick("left leg")}></div>
                            <div className="dot right-leg" onClick={() => this.handleBodyClick("right leg")}></div>
                            <div className="dot left-knee" onClick={() => this.handleBodyClick("left knee")}></div>
                            <div className="dot right-knee" onClick={() => this.handleBodyClick("right knee")}></div>
                            <div className="dot left-foot" onClick={() => this.handleBodyClick("left foot")}></div>
                            <div className="dot right-foot" onClick={() => this.handleBodyClick("right foot")}></div>
                            <div className="dot left-shin" onClick={() => this.handleBodyClick("left shin")}></div>
                            <div className="dot right-shin" onClick={() => this.handleBodyClick("right shin")}></div>
                            <div className="dot left-pelvis" onClick={() => this.handleBodyClick("left pelvis")}></div>
                            <div className="dot right-pelvis" onClick={() => this.handleBodyClick("right pelvis")}></div>
                            <div className="dot left-forearm" onClick={() => this.handleBodyClick("left forearm")}></div>
                            <div className="dot left-forearm" onClick={() => this.handleBodyClick("right forearm")}></div>

                            {/* Back Body Dots */}
                            <div className="dot back-head" onClick={() => this.handleBodyClick("back head")}></div>
                            <div className="dot back-neck" onClick={() => this.handleBodyClick("back neck")}></div>
                            <div className="dot upper-back" onClick={() => this.handleBodyClick("upper back")}></div>
                            <div className="dot middle-back" onClick={() => this.handleBodyClick("middle back")}></div>
                            <div className="dot lower-back" onClick={() => this.handleBodyClick("lower back")}></div>
                            <div className="dot back-left-shoulder" onClick={() => this.handleBodyClick("back left shoulder")}></div>
                            <div className="dot back-right-shoulder" onClick={() => this.handleBodyClick("back right shoulder")}></div>
                            <div className="dot back-left-arm" onClick={() => this.handleBodyClick("back left arm")}></div>
                            <div className="dot back-right-arm" onClick={() => this.handleBodyClick("back right arm")}></div>
                            <div className="dot back-left-hand" onClick={() => this.handleBodyClick("back left hand")}></div>
                            <div className="dot back-right-hand" onClick={() => this.handleBodyClick("back right hand")}></div>
                            <div className="dot back-left-leg" onClick={() => this.handleBodyClick("back left leg")}></div>
                            <div className="dot back-right-leg" onClick={() => this.handleBodyClick("back right leg")}></div>
                            <div className="dot back-left-knee" onClick={() => this.handleBodyClick("back left knee")}></div>
                            <div className="dot back-right-knee" onClick={() => this.handleBodyClick("back right knee")}></div>
                            <div className="dot back-left-foot" onClick={() => this.handleBodyClick("back left foot")}></div>
                            <div className="dot back-right-foot" onClick={() => this.handleBodyClick("back right foot")}></div>
                            <div className="dot back-ass" onClick={() => this.handleBodyClick("back left ass")}></div>
                            <div className="dot back-left-calf" onClick={() => this.handleBodyClick("back right calf")}></div>
                            <div className="dot back-right-calf" onClick={() => this.handleBodyClick("back right calf")}></div>
                            <div className="dot back-left-hand" onClick={() => this.handleBodyClick("back left hand")}></div>
                            <div className="dot back-right-hand" onClick={() => this.handleBodyClick("back right hand")}></div>
                            <div className="dot lower-left-quadrant" onClick={() => this.handleBodyClick("lower left quadrant")}></div>
                            <div className="dot lower-right-quadrant" onClick={() => this.handleBodyClick("lower right quadrant")}></div>
                            <div className="dot back-left-forearm" onClick={() => this.handleBodyClick("back left forearm")}></div>
                            <div className="dot back-right-forearm" onClick={() => this.handleBodyClick("back right forearm")}></div>
                        </div>
                    </div>

                    <h3>Selected Areas:</h3>
                    <ul>
                        {this.state.selectedPainAreas.map((area, index) => (
                            <li key={index}>{area}</li>
                        ))}
                    </ul>

                    {/* ✅ "Next" Button to go to HPatientView */}
                    <button className="button next-button" onClick={() => this.handleNextClickButton()}>
                        Next
                    </button>

                </div>
            </div>
        );
    }
}

// ✅ Wrap component with withRouter to enable navigation
export default withRouter(BodyImageView);

// Correct Export
const BodyImageSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: BodyImageView, // Already assigning BodyImageView here
};

// ✅ FIX: Remove duplicate export of BodyImageView
export { BodyImageSection };
