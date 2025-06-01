import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { GynecologySection } from "./GynecologyView";
import { VBox } from "../../HCard";
import "../../../style/ReferredDoctor.less";
import Axios from "axios";
import { SocialSelection } from "./SocialView";
import { getTranslation as t } from "../../../data/QuestionTranslation";
import { FinalThankYouSection } from "./thankYouView";
import birdImg from "../../../img/bird.png";
import { getProgress } from "../../../data/progressMap";

export abstract class ReferredDoctor<T extends ISectionProps> extends HView<T> {
  protected constructor(props: T) {
    super(props);
  }
}

export class ReferredDoctorView<T extends ISectionProps> extends ReferredDoctor<T> {
  constructor(props: T) {
    super(props);
    const stored = JSON.parse(localStorage.getItem("referredDoctor") || "{}");

    this.state = {
      referred: stored.referred || "",
      file: null,
      doctorName: stored.doctorName || "",
      recognizedText: stored.recognizedText || "",
      uploadedFilesCount: 0,
      progress: getProgress("referralUploadView", "default")
    };
  }

  componentDidUpdate(): void {
    const { referred, doctorName, recognizedText } = this.state;
    localStorage.setItem("referredDoctor", JSON.stringify({ referred, doctorName, recognizedText }));
  }

  handleBackClick = () => {
    this.props.dispatch(new SwitchViewAction(SocialSelection.defaultView));
  };

  handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    let birthNumber = "";

    const entryByKey = answers.find((entry: any) => entry.key === "birthNumber");
    if (entryByKey && entryByKey.value) {
      birthNumber = entryByKey.value;
    } else {
      const entryDirect = answers.find((entry: any) => entry.birthNumber);
      if (entryDirect) {
        birthNumber = entryDirect.birthNumber;
      }
    }

    console.log("📌 NUMBER:", birthNumber);

    const formData = new FormData();
    for (const file of files) {
      formData.append("file", file);
    }
    formData.append("birthNumber", birthNumber);

    try {
      const res = await Axios.post("/image/save", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.props.loginData.token
        }
      });

      if (res.data?.filePaths) {
        localStorage.setItem("referralFilePath", res.data.filePaths.join(", "));
        this.setState({ uploadedFilesCount: res.data.totalUploaded });
        console.log("📁 " + t("files_saved"), res.data.filePaths);
      } else {
        console.error("❌ " + t("error_no_file_paths"));
      }
    } catch (err) {
      console.error("❌ " + t("error_upload"), err);
    }
  };

  handleSave = () => {
    const { referred, doctorName, recognizedText } = this.state;

    if (referred !== "yes" && referred !== "no") return;

    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

    const translated = referred === "yes" ? t("yes") : t("no");

    const entry = {
      referredByDoctor: translated,
      referralDoctorName: doctorName || undefined,
      referralText: recognizedText || undefined,
      referralFilePaths: localStorage.getItem("referralFilePath")?.split(", ") || []
    };

    const alreadyExists = answers.some((a: any) => JSON.stringify(a) === JSON.stringify(entry));
    if (!alreadyExists) {
      answers.push(entry);
      localStorage.setItem("patientAnswers", JSON.stringify(answers));
    }

    const genderEntry = answers.find((a: any) => a.key === "gender" || a.gender);
    const genderValue = genderEntry?.value || genderEntry?.gender || "";

    if (genderValue.toLowerCase() === "female" || genderValue.toLowerCase() === "žena") {
      this.props.dispatch(new SwitchViewAction(GynecologySection.defaultView));
    } else {
      this.submitAllPatientAnswersToAPI();
    }
  };

  submitAllPatientAnswersToAPI = (): void => {
    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

    if (answers.length === 0) return;

    const formattedAnswers = answers.reduce((acc, obj) => {
      if ("key" in obj && "value" in obj && Object.keys(obj).length === 2) {
        acc[obj.key] = obj.value;
      } else {
        for (const key in obj) {
          acc[key] = obj[key];
        }
      }
      return acc;
    }, {});

    const lang = localStorage.getItem("language") || "cz";
    formattedAnswers.language = lang;

    Axios.post(`/answers/info`, formattedAnswers, {
      headers: {
        Authorization: "Bearer " + this.props.loginData.token,
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
          console.log("✅ " + t("submit_success"), response.data);
          localStorage.removeItem("patientAnswers");
      
          // 🔁 Notify other components (like HUserInfo) to refresh
          localStorage.setItem("hospitu_reload", "true");
      
          this.props.dispatch(new SwitchViewAction(FinalThankYouSection.defaultView));
      }) 
  };

  render(): ReactNode {
    const { referred, doctorName, recognizedText, uploadedFilesCount } = this.state;

    return (
      <div className="patient-view">
        <div className="container" id="symptom-input">
          <button className="back-button" onClick={this.handleBackClick}>← {t("back")}</button>
          <div className="progress-container">
                <div className="progress-bar-wrapper">
                    <div className="progress-bar">
                        <div className="progress completed" style={{ width: `${this.state.progress}%` }}></div>
                    </div>
                    <img src={birdImg} className="progress-icon" style={{ left: `${this.state.progress}%` }} alt="progress" />
                </div>
                <span className="progress-label">{t("progress_basic_info")}</span>
            </div>

          <div className="question-row">
            <h2>{t("referred_question")}</h2>
            <div className="button-group">
              <button
                type="button"
                className={`answer-button ${referred === "yes" ? "selected" : ""}`}
                onClick={() => this.setState({ referred: "yes" })}
              >
                {t("yes")}
              </button>
              <button
                type="button"
                className={`answer-button ${referred === "no" ? "selected" : ""}`}
                onClick={() => this.setState({ referred: "no", file: null, doctorName: "", recognizedText: "" })}
              >
                {t("no")}
              </button>
            </div>
          </div>

          {referred === "yes" && (
            <div className="followup-section">
              <h2>{t("referred_upload_prompt")}</h2>
              <input type="file" accept="image/*,application/pdf" onChange={this.handleFileChange} multiple />

              {uploadedFilesCount > 0 && (
                <p>{uploadedFilesCount} {t("files_uploaded")}</p>
              )}

              <h2>{t("referred_doctor_name_question")}</h2>
              <input
                type="text"
                placeholder={t("referred_doctor_name_placeholder")}
                value={doctorName}
                onChange={(e) => this.setState({ doctorName: e.target.value })}
              />
            </div>
          )}

          <div>
            <button className="button-next" onClick={this.handleSave}>{t("button_next")}</button>
          </div>
        </div>
      </div>
    );
  }
}

const ReferredDoctorSection: IHSection = {
  menuItems: [],
  permitsUserManagement: false,
  defaultView: ReferredDoctorView,
};

export { ReferredDoctorSection };
