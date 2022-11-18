import React, {Component} from 'react';
import Input from './../formInput';
import FormSelect from "../formSelect";
import locales_es from "../../locales/es";
import FormNewDatePicker from "../formNewDatePicker";
import {HREF_PAGE_TERMS} from "../../models/constants";
import Select from 'react-select'

export class Form extends Component {
    render() {
        const {handleChange, handleDateChange, handleReactSelectChange, onSubmit, onSubmitButtonText, inputs, showTerms, wrapper, formIndex, wrapperClassName} = this.props;
        return (
            <>
                {this.props.children}
                <div className={wrapperClassName || (wrapper ? 'kt-portlet__body' : '')}>
                    <form onSubmit={(ev) => {
                        ev.preventDefault();
                        onSubmit && onSubmit();
                    }} className={this.props.styles}>
                        <>
                            {inputs.map((input) => {
                                return (
                                    input.type === 'select' ?
                                        <FormSelect
                                            value={input.value === null ? '' : input.value}
                                            label={input.label}
                                            type={input.type}
                                            key={input.id}
                                            id={input.id}
                                            required={input.required}
                                            disabled={input.disabled}
                                            options={input.options}
                                            wrapperCustomClassName={input.wrapperCustomClassName}
                                            customClassName={input.customClassName}
                                            handleChange={handleChange(input.state, formIndex)}
                                            selectedValue={input.selectedValue}
                                            primaryAction={input.primaryAction}
                                            secondaryAction={input.secondaryAction}
                                            children={input.children}
                                        />
                                        : input.type === 'react-select' ?
                                        <div key={input.id} className={input.wrapperCustomClassName}>
                                            <label>{input.label} {input.required ? '*' : ''}</label><br/>
                                            <Select
                                                options={input.options}
                                                className={input.customClassName}
                                                classNamePrefix="select"
                                                value={input.value}
                                                isDisabled={input.disabled}
                                                isLoading={false}
                                                isClearable={false}
                                                isSearchable={true}
                                                name={input.id}
                                                onChange={handleReactSelectChange(input.state)}
                                            />
                                            {this.props.advice &&
                                            <span className="form-text text-muted">{this.props.advice}</span>
                                            }
                                        </div>
                                        : input.type === 'date' ?
                                            <FormNewDatePicker
                                                value={input.value === null ? '' : input.value}
                                                label={input.label}
                                                placeholder={input.placeholder}
                                                autoComplete={input.autoComplete}
                                                type={input.type}
                                                key={input.id}
                                                id={input.id}
                                                required={input.required}
                                                disabled={input.disabled}
                                                wrapperCustomClassName={input.wrapperCustomClassName}
                                                customClassName={input.customClassName}
                                                handleChange={handleDateChange(input.state)}
                                                minDate={input.minDate}
                                                maxDate={input.maxDate}
                                                info={input.info}
                                            />
                                            :
                                            input.type === 'number' ?
                                                <Input
                                                    value={input.value === null ? '' : input.value}
                                                    label={input.label}
                                                    placeholder={input.placeholder}
                                                    autoComplete={input.autoComplete}
                                                    type={input.type}
                                                    key={input.id}
                                                    id={input.id}
                                                    required={input.required}
                                                    disabled={input.disabled}
                                                    step={input.step}
                                                    min={input.min}
                                                    max={input.max}
                                                    wrapperCustomClassName={input.wrapperCustomClassName}
                                                    customClassName={input.customClassName}
                                                    handleChange={handleChange(input.state, formIndex)}
                                                />
                                                :
                                                input.type === 'tel' ?
                                                        <Input
                                                            value={input.value === null ? '' : input.value}
                                                            label={input.label}
                                                            placeholder={input.placeholder}
                                                            autoComplete={input.autoComplete}
                                                            type={input.type}
                                                            key={input.id}
                                                            id={input.id}
                                                            required={input.required}
                                                            disabled={input.disabled}
                                                            step={input.step}
                                                            min={input.min}
                                                            max={input.max}
                                                            wrapperCustomClassName={input.wrapperCustomClassName}
                                                            customClassName={input.customClassName}
                                                            handleChange={handleChange(input.state, formIndex)}
                                                        >
                                                            {input.children}
                                                        </Input>
                                                    :
                                                    <Input
                                                        value={input.value === null ? '' : input.value}
                                                        label={input.label}
                                                        placeholder={input.placeholder}
                                                        autoComplete={input.autoComplete}
                                                        type={input.type}
                                                        key={input.id}
                                                        id={input.id}
                                                        required={input.required}
                                                        disabled={input.disabled}
                                                        wrapperCustomClassName={input.wrapperCustomClassName}
                                                        customClassName={input.customClassName}
                                                        handleChange={handleChange(input.state, formIndex)}
                                                        advice={input.advice}
                                                        info={input.info}
                                                        transform={input.transform}
                                                    />
                                )
                                }
                            )
                            }
                        </>
                        {showTerms ?
                            <div className="form-group" style={{clear: 'both'}}>
                                <label className="kt-checkbox kt-checkbox--bold kt-checkbox--brand">
                                    <input id="inputCheckTerms" className="form-control"
                                           required={true} type="checkbox" defaultChecked/>
                                    <a href={HREF_PAGE_TERMS} target="_blank">
                                        {locales_es.iAcceptTermsAndConditions}
                                    </a>
                                    <span></span>
                                </label>
                            </div>
                            : null}
                        {/*<div className="mb-5">* {locales_es.requiredFields}</div>*/}
                        <div
                            className={"kt-login-v2__actions clear flex-wrap justify-content-center justify-content-md-around " + this.props.buttonWrapperStyle}>
                            {this.props.onSubmit &&
                            <button type="submit"
                                    className="btn btn-brand btn-elevate btn-pill m-3 align-self-start">{onSubmitButtonText}</button>
                            }
                            {this.props.secondaryButtonText && this.props.onClickSecondaryButton &&
                            <a href="#click" onClick={(e) => {
                                e.preventDefault();
                                this.props.onClickSecondaryButton();
                            }}
                               style={{marginRight: '10px'}}
                               className={"kt-link kt-link--brand m-3 " + this.props.secondaryButtonStyle}>
                                {this.props.secondaryButtonText}
                            </a>
                            }
                        </div>
                    </form>
                </div>
            </>
        )
    }
}

export default Form
