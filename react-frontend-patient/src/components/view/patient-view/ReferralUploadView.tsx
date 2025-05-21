import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { GynecologySection } from "./GynecologyView";
import { VBox } from "../../HCard";
import "../../../style/ReferredDoctor.less";
import Axios from "axios";
import { SocialSelection } from "./SocialView";

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
      recognizedText: stored.recognizedText || ""
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
    const file = e.target.files?.[0] || null;
    this.setState({ file });

    if (!file) return;

    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    const birthEntry = answers.find((entry: any) => entry.key === "birthNumber");
    const birthNumber = birthEntry?.value;

    if (!birthNumber) {
      alert("❌ Rodné číslo nebylo nalezeno v odpovědích.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("birthNumber", birthNumber);

    try {
      const res = await Axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.filePath) {
        localStorage.setItem("referralFilePath", res.data.filePath);
        console.log("📁 Soubor uložen na:", res.data.filePath);
      } else {
        console.error("❌ Server nevrátil cestu k souboru.");
      }
    } catch (err) {
      console.error("❌ Chyba při uploadu:", err);
    }
  };

  handleSave = () => {
    const { referred, file, doctorName, recognizedText } = this.state;
    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

    const entry = {
      referredByDoctor: referred === "yes",
      referralDoctorName: doctorName || undefined,
      referralFileName: file?.name || undefined,
      referralText: recognizedText || undefined,
      referralFilePath: localStorage.getItem("referralFilePath") || undefined
    };

    answers.push(entry);
    localStorage.setItem("patientAnswers", JSON.stringify(answers));

    const genderEntry = answers.find((a: any) => a.key === "gender");
    const gender = genderEntry?.value?.toLowerCase();

    if (gender === "female") {
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

    Axios.post(`/answers/info`, formattedAnswers, {
      headers: {
        Authorization: "Bearer " + this.props.loginData.token,
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        console.log("✅ Submitted:", response.data);
        localStorage.removeItem("patientAnswers");
        alert("Patient answers successfully submitted!");
      })
      .catch((error) => {
        console.error("❌ Submit error:", error);
        alert("Error submitting patient data. Please try again.");
      });
  };

  render(): ReactNode {
    const { referred, doctorName, recognizedText } = this.state;

    return (
      <div className="patient-view">
        <div className="container" id="symptom-input">
          <button className="back-button" onClick={this.handleBackClick}>← Back</button>

          <div className="question-row">
            <h2>Byl jste poslán do nemocnice jiným lékařem?</h2>
            <div className="button-group">
              <button
                type="button"
                className={`answer-button ${referred === "yes" ? "selected" : ""}`}
                onClick={() => this.setState({ referred: "yes" })}
              >
                Ano
              </button>
              <button
                type="button"
                className={`answer-button ${referred === "no" ? "selected" : ""}`}
                onClick={() => this.setState({ referred: "no", file: null, doctorName: "", recognizedText: "" })}
              >
                Ne
              </button>
            </div>
          </div>

          {referred === "yes" && (
            <div className="followup-section">
              <h2>Můžete nahrát doporučení nebo zprávu?</h2>
              <input type="file" accept="image/*,application/pdf" onChange={this.handleFileChange} />

              <h2>Rozpoznaný text:</h2>
              <textarea
                value={recognizedText}
                onChange={(e) => this.setState({ recognizedText: e.target.value })}
                placeholder="Rozpoznaný text z obrázku"
                style={{
                  width: "100%",
                  height: "200px",
                  padding: "10px",
                  fontSize: "14px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  marginTop: "10px"
                }}
              />

              <h2>Vzpomínáte si na jméno lékaře, který vás poslal?</h2>
              <input
                type="text"
                placeholder="Jméno lékaře (nepovinné)"
                value={doctorName}
                onChange={(e) => this.setState({ doctorName: e.target.value })}
              />
            </div>
          )}

          <div>
            <button className="button-next" onClick={this.handleSave}>Next</button>
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
