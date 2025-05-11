import { HView, IHSection, ISectionProps } from "../HView";
import React, { ReactNode } from "react";
import "../../../style/body-parts.less";
import { withRouter, RouteComponentProps } from "react-router-dom";
import bodyImage from "../../../img/body.png";
import { Dispatch } from "redux";
import { SwitchViewAction } from "../../../data/AppAction";
import { GenderInfoSection } from "./GenderView";
import { HPatientSection } from "./HPatientView";

interface HPatientState {
  showErrorMessage: boolean;
  selectedPainAreas: string[];
  hoveredArea: string | null;
}

interface BodyImageProps extends ISectionProps, RouteComponentProps {
  dispatch: Dispatch;
}

export class BodyImageView<T extends ISectionProps> extends HView<T & BodyImageProps> {
  constructor(props: T & BodyImageProps) {
    super(props);

    const stored = JSON.parse(localStorage.getItem("selectedPainAreas") || "[]");
    const valid = Array.isArray(stored) ? stored.filter(a => typeof a === "string") : [];

    this.state = {
      showErrorMessage: false,
      selectedPainAreas: valid,
      hoveredArea: null,
    };
  }

  handleBodyClick = (area: string) => {
    this.setState((prevState: HPatientState) => {
      const selected = prevState.selectedPainAreas.includes(area)
        ? prevState.selectedPainAreas.filter((item) => item !== area)
        : [...prevState.selectedPainAreas, area];

      localStorage.setItem("selectedPainAreas", JSON.stringify(selected));
      return { selectedPainAreas: selected };
    });
  };

  handleBackClick = (): void => {
    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    const keysToRemove = [
      "age", "gender", "birthNumber", "painAreas", "painType", "painChange",
      "painWorseTriggers", "painRelief", "painIntensity", "painTime", "painTriggers"
    ];
    const filteredAnswers = answers.filter(
      (entry: any) => !keysToRemove.some((key) => entry.hasOwnProperty(key))
    );
    localStorage.setItem("patientAnswers", JSON.stringify(filteredAnswers));
    this.props.dispatch(new SwitchViewAction(GenderInfoSection.defaultView));
  };

  handleNextClickButton = (): void => {
    const answers = JSON.parse(localStorage.getItem("patientAnswers") || "[]");
    const filtered = answers.filter((entry: any) => !entry.hasOwnProperty("painAreas"));
    filtered.push({ painAreas: this.state.selectedPainAreas });
    localStorage.setItem("patientAnswers", JSON.stringify(filtered));
    localStorage.setItem("selectedPainAreas", JSON.stringify(this.state.selectedPainAreas));
    this.props.dispatch(new SwitchViewAction(HPatientSection.defaultView));
  };

  render(): ReactNode {
    const { hoveredArea, selectedPainAreas } = this.state;

    const polygon = (points: string, name: string, label: string) => {
      const isHovered = hoveredArea === name;
      const isSelected = selectedPainAreas.includes(name);
      const className = `region${isHovered ? " active" : ""}${isSelected ? " selected" : ""}`;
      return (
        <polygon
          key={name}
          points={points}
          className={className}
          onMouseEnter={() => this.setState({ hoveredArea: name })}
          onMouseLeave={() => this.setState({ hoveredArea: null })}
          onClick={() => this.handleBodyClick(name)}
        >
          <title>{label}</title>
        </polygon>
      );
    };

    return (
      <div className="body-view">
        <div className="container-body" id="symptom-input">
          <button className="back-button" onClick={this.handleBackClick}>← Back</button>
          <h2 className="body-title">Vyberte, kde pociťujete bolest</h2>
          <div className="body-wrapper-single">
            <img src={bodyImage} alt="Tělo" className="base-image" />
            <svg
              className="hover-overlay"
              viewBox="0 0 1025 1024"
              preserveAspectRatio="xMidYMid meet"
            >
              {polygon("275,28 295,41 303,62 306,83 313,84 311,96 311,109 301,118 296,127 291,140 283,150 269,154 251,154 242,145 231,136 227,122 216,108 215,87 222,69 227,48 241,33 258,28", "head", "Hlava")}
                {polygon("231,146 228,158 225,165 217,174 207,179 196,183 190,188 196,192 207,193 220,195 233,196 252,197 270,198 290,196 302,194 320,193 333,192 342,189 318,179 307,172 296,162 291,152 292,144 282,149 277,153 268,156 257,156 248,152 239,149", "neck", "Krk")}
                {polygon("266,200 280,198 296,198 308,198 322,194 336,190 350,190 361,195 369,199 377,208 382,219 386,228 388,239 386,246 376,246 366,249 356,254 352,260 350,270 349,277 343,284 334,285 322,288 311,289 298,288 284,288 277,289 267,290 264,275 263,259 263,241 264,227 263,209", "left-breast", "Levé prso")}
                {polygon("185,189 170,191 158,197 148,206 142,221 140,233 139,243 148,246 161,247 172,254 178,259 179,270 181,278 189,284 198,285 213,286 226,288 247,289 258,289 264,289 264,276 264,259 262,242 262,229 262,217 263,206 262,197 247,197 226,194 208,191 197,188", "right-breast", "Pravé prso")}
                {polygon("359,254 372,251 386,248 390,257 392,270 396,280 400,292 403,305 407,322 415,334 417,343 408,346 398,352 387,354 379,354 372,346 369,332 362,319 358,300 351,283 350,269 352,258", "left-arm", "Levá paže")}
                {polygon("378,362 383,377 391,387 395,401 401,413 408,426 415,437 421,448 427,457 430,468 438,468 445,464 451,460 457,457 455,446 451,431 447,416 441,400 435,386 429,367 424,354 417,343 410,347 404,352 396,356 386,359", "left-forearm", "Levé předloktí")}
                {polygon("431,469 439,468 447,466 453,462 461,459 465,464 473,468 480,471 487,476 495,481 500,488 505,493 506,498 497,497 491,493 480,496 482,501 485,507 487,513 491,520 493,530 496,538 496,544 488,542 482,524 476,515 479,529 480,535 482,547 482,554 475,552 474,544 470,535 469,527 464,520 463,531 464,537 466,547 464,554 459,548 457,540 455,531 451,522 448,530 449,536 449,542 447,548 440,532 440,524 438,512 436,501 434,477 432,485", "left-hand", "Levá ruka")}
                {polygon("136,249 136,258 130,270 128,281 124,294 123,308 119,320 113,332 109,342 117,349 124,354 133,356 142,359 150,362 154,350 160,337 165,326 170,311 172,294 176,281 176,268 170,258 159,252 148,249", "right-arm", "Pravá paže")}
                {polygon("110,342 115,346 124,352 142,358 149,361 146,371 139,380 135,390 131,401 126,411 120,423 113,433 106,445 102,456 97,466 89,461 80,458 74,454 67,447 75,436 83,425 83,412 86,398 95,371 100,355 105,348", "right-forearm", "Pravé předloktí")}
                {polygon("69,451 76,455 82,458 91,463 94,469 92,479 92,489 90,499 89,511 87,521 85,532 83,543 78,547 76,536 77,524 72,529 70,543 66,553 57,551 57,543 60,534 63,527 65,518 48,554 45,545 46,536 47,527 52,519 38,537 33,541 32,532 37,521 43,508 45,495 45,487 33,495 25,497 27,486 46,474 58,464 66,458", "right-hand", "Pravá ruka")}
                {polygon("180,286 193,288 209,291 221,291 237,292 254,292 270,291 291,292 306,292 325,291 336,288 347,280 346,293 346,304 346,314 344,326 342,333 342,344 341,349 334,354 319,354 306,353 291,353 280,353 263,353 252,352 236,353 220,353 207,354 195,353 188,353 184,339 180,319 178,301", "upper-updomen", "Horní břicho")}
                {polygon("179,429 178,443 176,456 175,468 171,478 181,484 195,487 211,492 226,499 242,508 251,518 261,521 271,519 283,512 293,506 307,497 321,490 336,485 348,483 351,470 346,451 347,440 345,425 334,427 318,430 300,433 279,434 257,434 238,433 222,432 199,430 187,425", "pelvis", "Pánev")}
                {polygon("293,651 316,649 338,650 352,651 352,671 357,688 359,708 362,722 364,736 365,752 367,761 350,762 334,762 319,759 308,759 312,743 312,724 301,706 295,683 295,666", "left-knee", "Levé koleno")}
                {polygon("308,762 324,764 339,766 356,763 365,761 367,782 363,802 360,828 360,847 358,867 356,879 344,880 334,880 326,879 326,866 322,841 316,820 308,797 306,776", "left-shin", "Levý bérec")}
                {polygon("326,880 338,881 351,881 357,881 357,892 359,907 361,913 355,917 344,917 333,917 325,913 325,905 327,892", "left-ankle", "Levý kotník")}
                {polygon("327,915 339,918 351,917 360,915 362,926 369,935 374,942 382,950 385,959 384,965 374,973 367,977 357,977 344,976 338,968 333,954 328,942 325,930", "left-foot", "Levá noha")}
                {polygon("175,651 190,649 211,652 227,653 234,652 233,667 228,686 224,701 220,716 218,731 220,748 221,759 211,762 190,762 176,762 161,760 161,744 168,722 175,698 173,675 172,664", "right-knee", "Pravé koleno")}
                {polygon("161,760 175,762 188,765 202,765 216,763 220,774 215,791 212,809 210,823 205,835 203,853 202,866 201,879 192,878 180,878 171,879 169,863 167,836 162,809 158,777", "right-shin", "Pravý bérec")}
                {polygon("171,883 182,881 193,883 200,880 199,896 199,909 200,922 192,923 180,923 171,921 167,910 169,894", "right-ankle", "Pravý kotník")}
                {polygon("168,918 177,921 189,923 199,923 200,934 196,945 193,959 188,971 180,977 170,975 164,975 154,973 146,970 142,958 150,948 161,934", "right-foot", "Pravá noha")}
                {polygon("267,354 282,354 296,354 313,354 329,356 337,356 340,367 341,379 344,393 346,406 347,418 344,426 329,429 318,430 294,434 280,435 268,435 263,422 262,401 262,378 263,366", "lower-left-abdomen", "Dolní levé břicho")}
                {polygon("187,353 185,368 184,385 181,399 181,411 181,421 192,426 205,426 223,429 233,431 247,431 260,433 265,421 263,408 263,397 263,382 263,368 262,354 251,352 223,352 206,352", "lower-right-abdomen", "Dolní pravé břicho")}
                {polygon("269,522 279,517 290,510 304,499 318,496 331,489 349,486 353,494 357,508 360,524 362,539 362,556 362,573 362,586 361,602 361,617 360,631 358,642 357,649 347,649 332,649 319,651 306,651 298,651 292,642 286,621 282,595 276,567 270,536", "left-thigh", "Levé stehno")}
                {polygon("173,483 189,484 202,490 218,497 234,504 250,513 256,523 258,540 252,558 249,582 246,599 241,618 237,636 235,650 216,650 193,651 176,650 169,634 164,605 165,577 166,547 167,520 172,495", "right-thigh", "Pravé stehno")}
            
                {polygon("759,26 776,29 789,34 798,42 802,55 805,69 803,82 810,83 813,90 810,98 810,110 803,115 799,122 796,131 790,137 790,142 782,146 774,148 763,147 753,147 744,147 736,146 730,138 728,129 725,122 718,118 714,108 712,98 712,90 714,84 721,87 718,73 720,62 723,48 731,38 741,29 746,28 752,28 755,27 752,28 768,27", "back-head", "Zadní hlava")}
                {polygon("685,185 698,190 712,192 731,195 747,197 763,198 780,197 796,195 808,193 821,190 835,189 846,187 827,182 815,177 803,170 795,160 792,149 791,141 780,144 771,147 760,146 751,146 743,146 735,145 732,153 726,162 719,171 711,178 700,181", "back-neck", "Zadní krk")}
                {polygon("635,247 645,250 659,254 667,258 671,266 673,277 672,288 669,302 664,312 659,323 655,333 652,342 647,352 646,359 635,357 623,353 615,349 607,342 614,334 619,320 621,308 623,296 627,281 631,267 633,257", "back-right-arm", "Zadní pravá paže")}
                {polygon("606,342 614,346 621,351 633,358 643,358 645,365 638,377 632,389 627,402 619,414 614,426 607,438 600,447 596,459 591,470 583,463 575,456 567,453 572,438 578,418 583,401 591,382 595,364 598,350", "back-right-forearm", "Zadní pravé předloktí")}
                {polygon("565,452 572,453 578,458 584,463 589,468 588,476 588,489 585,504 583,517 582,529 580,541 575,545 574,533 575,518 570,528 568,538 564,545 560,551 556,542 558,530 560,519 552,547 547,551 541,538 545,525 548,515 534,541 527,541 526,531 540,505 545,489 531,498 524,491 536,480 554,464", "back-right-hand", "Zadní pravá ruka")}
                {polygon("852,294 851,279 856,266 866,254 880,250 891,246 893,258 896,273 900,288 905,302 910,316 915,328 921,338 915,346 906,351 895,355 887,357 881,358 875,345 867,327 860,315 857,305", "back-left-arm", "Zadní levá paže")}
                {polygon("883,358 893,359 905,354 916,347 922,342 930,353 935,366 939,382 944,399 950,415 955,431 960,448 963,454 954,458 946,460 936,462 930,450 918,433 909,416 899,398 890,382 884,369", "back-left-forearm", "Zadní levé předloktí")}
                {polygon("936,463 945,461 955,458 962,455 968,461 979,470 987,476 994,481 1002,488 1004,495 1003,500 995,497 984,488 986,500 993,514 998,526 1001,536 1002,543 994,539 981,518 984,527 986,540 985,549 976,542 973,526 970,516 973,548 969,554 963,542 959,528 957,518 955,536 955,545 949,545 947,532 942,510 937,488 937,473", "back-left-hand", "Zadní levá ruka")}
                {polygon("763,317 845,318 849,302 850,283 852,266 858,257 848,238 839,224 829,211 819,194 799,194 782,197 763,198", "right-upper-back", "Horní část zad – pravá")}
                {polygon("764,316 681,317 678,303 676,286 674,270 667,257 677,238 686,222 694,210 705,194 727,195 743,198 763,198", "left-upper-back", "Horní část zad – levá")}
                {polygon("703,194 693,210 682,226 675,239 666,257 655,252 645,249 635,247 635,234 639,223 643,211 650,201 662,193 678,188 689,187", "back-left-shoulder", "Zadní levé rameno")}
                {polygon("819,193 825,202 832,214 840,225 847,237 858,256 871,251 883,249 892,246 890,230 884,216 878,204 868,194 855,188 841,188 831,190", "back-right-shoulder", "Zadní pravé rameno")}
                {polygon("687,347 838,346 843,332 847,318 811,316 775,315 763,315 725,315 681,317", "middle-back", "Střední část zad")}
                {polygon("763,417 817,417 843,421 841,396 839,372 840,350 764,348", "right-lower-back", "Dolní část zad – pravá")}
                {polygon("688,348 764,348 765,416 724,418 683,420", "left-lower-back", "Dolní část zad – levá")}
                {polygon("680,420 751,418 812,418 843,420 851,463 856,508 836,516 822,518 808,519 793,518 780,516 763,508 753,514 732,518 713,519 697,516 680,514 670,510", "ass", "Hýždě")}
                {polygon("671,510 693,518 711,520 731,520 747,517 762,511 759,535 752,562 748,590 743,615 736,635 735,649 715,650 689,650 672,650 666,614 663,578 667,543", "back-left-thigh", "Zadní levé stehno")}
                {polygon("763,511 780,518 797,522 819,521 839,518 855,513 859,530 861,554 863,574 862,604 858,629 856,650 792,650 785,619 774,580 767,546", "back-right-thigh", "Zadní pravé stehno")}
                {polygon("672,649 698,651 734,649 731,675 726,699 719,716 717,731 721,751 719,758 700,758 658,759 661,736 667,712 671,689 671,670", "back-left-knee", "Zadní levé koleno")}
                {polygon("793,649 854,650 855,677 859,705 867,729 871,760 807,757 812,736 810,720 801,698 794,673", "back-right-knee", "Zadní pravé koleno")}
                {polygon("655,759 719,760 718,791 709,823 703,866 701,895 703,907 667,906 670,878 665,840 656,794", "back-left-calf", "Zadní levé lýtko")}
                {polygon("807,758 870,759 870,795 863,836 858,878 859,899 862,911 827,911 828,897 828,873 822,841 812,807 807,779", "back-right-calf", "Zadní pravé lýtko")}
                {polygon("668,906 703,908 703,923 704,935 706,947 706,957 703,965 692,970 677,969 668,959 659,946 653,935 664,924", "back-left-foot", "Zadní levé chodidlo")}
                {polygon("825,910 859,911 862,921 869,931 875,938 871,946 863,951 859,960 851,965 839,967 826,962 821,951 823,937 827,926", "back-right-foot", "Zadní pravé chodidlo")}
            </svg>
          </div>
          <button className="button next-button mt-3" onClick={this.handleNextClickButton}>
            next
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(BodyImageView);

export const BodyImageSection: IHSection = {
  menuItems: [],
  permitsUserManagement: false,
  defaultView: BodyImageView,
};
