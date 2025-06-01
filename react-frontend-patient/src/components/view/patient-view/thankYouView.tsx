import React, { ReactNode } from "react";
import "../../../style/final-thank-you.less";
import { HView, IHSection, ISectionProps } from "../HView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class FinalThankYou<T extends ISectionProps> extends HView<T> {
    protected constructor(props: T) {
        super(props);
    }
}

export class FinalThankYouView<T extends ISectionProps> extends FinalThankYou<T> {
    constructor(props: T) {
        super(props);

        this.state = {
            progress: getProgress("thankYouView", "default")
          };
    }

    render(): ReactNode {
        return (
            <div className="patient-view">
                <div className="container final-container">
                    <div className="progress-container">
                        <div className="progress-bar-wrapper">
                            <div className="progress-bar">
                                <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                            </div>
                            <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                        </div>
                        <span className="progress-label">{t("progress_basic_info")}</span>
                    </div>

                    <div className="thank-you-card">
                        <h1>{t("thank_you_title")}</h1>
                        <p>{t("thank_you_description")}</p>
                    </div>
                </div>
            </div>
        );
    }
}

const FinalThankYouSection: IHSection = {
    menuItems: [],
    permitsUserManagement: false,
    defaultView: FinalThankYouView,
};

export { FinalThankYouSection };
