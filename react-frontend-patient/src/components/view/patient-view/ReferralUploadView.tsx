import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import { SwitchViewAction } from "../../../data/AppAction";
import { AllergyFoodSelection } from "./AllergyFoodView";
import { PersonalInfoSection } from "./PersonalInfo";
import { VBox, HBox } from "../../HCard";
import "../../../style/ReferredDoctor.less";
import { GynecologySection } from "./GynecologyView";
import Axios from "axios";

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
      doctorName: stored.doctorName || ""
    };
  }

  componentDidUpdate(): void {
    localStorage.setItem("referredDoctor", JSON.stringify({
      referred: this.state.referred,
      doctorName: this.state.doctorName
    }));
  }

  handleBackClick = () => {
    this.props.dispatch(new SwitchViewAction(AllergyFoodSelection.defaultView));
  };

  handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    this.setState({ file });
  };

  handleSave = () => {
    const { referred, file, doctorName } = this.state;
    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");

    const entry = {
      referredByDoctor: referred === "yes",
      referralDoctorName: doctorName || undefined,
      referralFileName: file?.name || undefined
    };

    const exists = answers.some((a) => JSON.stringify(a) === JSON.stringify(entry));
    if (!exists) {
      answers.push(entry);
      localStorage.setItem("patientAnswers", JSON.stringify(answers));
    }

    const genderEntry = answers.find((a: any) => a.key === "gender");
    const gender = genderEntry?.value?.toLowerCase();

    console.log("gender" + gender)

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
      // Speciálně zpracuj { key: "...", value: "..." } záznamy
      if ("key" in obj && "value" in obj && Object.keys(obj).length === 2) {
          acc[obj.key] = obj.value;
      } else {
          for (const key in obj) {
              if (Array.isArray(acc[key]) && Array.isArray(obj[key])) {
                  acc[key] = [...acc[key], ...obj[key]];
              } else if (typeof acc[key] === "object" && typeof obj[key] === "object") {
                  acc[key] = { ...acc[key], ...obj[key] };
              } else {
                  acc[key] = obj[key];
              }
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
    const { referred, doctorName } = this.state;

    return (
      <div className="referral-container">
        <button className="back-button" onClick={this.handleBackClick}>← Zpět</button>

        <div className="question-row">
          <h2>Byl jste poslán do nemocnice jiným lékařem?</h2>
          <div className="choice-radio-group">
            <label className={`radio-option ${referred === "yes" ? "selected" : ""}`}>
              <input
                type="radio"
                name="referred"
                value="yes"
                checked={referred === "yes"}
                onChange={() => this.setState({ referred: "yes" })}
              />
              Ano
            </label>
            <label className={`radio-option ${referred === "no" ? "selected" : ""}`}>
              <input
                type="radio"
                name="referred"
                value="no"
                checked={referred === "no"}
                onChange={() => this.setState({ referred: "no", file: null, doctorName: "" })}
              />
              Ne
            </label>
          </div>
        </div>

        {referred === "yes" && (
          <div className="followup-section">
            <h2>Můžete nahrát doporučení nebo zprávu?</h2>
            <input type="file" accept="image/*,application/pdf" onChange={this.handleFileChange} />

            <h2>Vzpomínáte si na jméno lékaře, který vás poslal?</h2>
            <input
              type="text"
              placeholder="Jméno lékaře (nepovinné)"
              value={doctorName}
              onChange={(e) => this.setState({ doctorName: e.target.value })}
            />
          </div>
        )}

        <div style={{ marginTop: "30px" }}>
          <button className="submit-button" onClick={this.handleSave}>Next</button>
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
