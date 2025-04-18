import React, { ChangeEvent, ReactNode } from "react";
import "../style/h-input.less";
import { HFieldInfo } from "./HForm";

export class HInput extends React.Component<{
    label: string,
    type?: string,
    required?: boolean,
    readOnly?: boolean,
    minLength?: number,
    maxLength?: number,
    pattern?: string,
    flexGrow?: boolean,
    fieldInfo: HFieldInfo
}, {
    value: string
}> {
    constructor(props: never) {
        super(props);

        this.state = {
            value: this.props.fieldInfo.fieldValue()
        };
    }

    valueChanged = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        this.setState({ value });
        this.props.fieldInfo.changeHandler(value);
    };

    render(): ReactNode {
        const { label, type, required, readOnly, minLength, maxLength, pattern, flexGrow } = this.props;
        const { value } = this.state;
        return (
            <div className={`h-input-container${flexGrow ? " h-input-container-grow" : ""}`}>
                <input
                    className="h-input"
                    type={type ?? "text"}
                    required={required ?? false}
                    readOnly={readOnly ?? false}
                    minLength={minLength}
                    maxLength={maxLength}
                    pattern={pattern}
                    value={value}
                    onChange={this.valueChanged}
                    placeholder=" "
                />
                <label className={`h-input-placeholder${required ? " h-input-required" : ""}`}>
                    {label}
                </label>
            </div>
        );
    }
}

export class HFlow extends React.Component<{ right?: boolean }> {
    render(): ReactNode {
        return (
            <div className="h-flow">
                {this.props.right ? <div className="h-flow-filler" /> : null}
                {this.props.children}
                {!this.props.right ? <div className="h-flow-filler" /> : null}
            </div>
        );
    }
}
