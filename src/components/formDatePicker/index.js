import React, {Component} from 'react';
import {langCode} from '../../locales/es';

export default class FormDatePicker extends Component {

    initDatePicker() {
        if(window.$('.datePicker').length) {
            setTimeout(() => {
                window.$('.datePicker').datepicker({
                    language: langCode,
                    autoclose: true,
                }).on('changeDate', (e) => {
                    this.props.handleChange(e);
                });
            }, 1500);
        }
    }

    render() {
        const {id, name, value, required, handleChange, customClassName, wrapperCustomClassName} = this.props;
        const defaultClassName = 'form-control datePicker ';
        const className = customClassName ? (defaultClassName + customClassName) : defaultClassName;

        const defaultWrapperClassName = 'form-group ';
        const wrapperClassName = wrapperCustomClassName ? (defaultWrapperClassName + wrapperCustomClassName) : defaultWrapperClassName;

        this.initDatePicker();

        return (
            <div className={wrapperClassName}>
                <label>{this.props.label}</label>
                <div className="input-group date">
                    <input type="text" className={className} readOnly
                           onChange={handleChange}
                           name={name}
                           value={value}
                           key={id}
                           required={required}
                           placeholder={this.props.placeholder}/>
                    <div className="input-group-append">
                            <span className="input-group-text">
                                <i className="la la-calendar-check-o" />
                            </span>
                    </div>
                </div>
            </div>
        );
    }
}
