import React, {Component} from 'react';
import "../../../node_modules/react-datepicker/dist/react-datepicker.css";
import {langCode} from '../../locales/es';
import DatePicker from "react-datepicker";
import {registerLocale} from "react-datepicker";
import es from 'date-fns/locale/es';
import IMask from 'imask';

registerLocale(langCode, es);

const mask = 'dd/MM/yyyy';

export default class FormDatePicker extends Component {
  constructor(props) {
    super(props);

    this.datePickerRef = React.createRef();
    this.mask = null;
  }

  componentDidMount() {
    this.mask = IMask(this.datePickerRef.current.input, {
      mask: Date,
      pattern: 'd/m/`Y',
      format: function (date) {
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        if (day < 10) {
          day = '0' + day;
        }
        if (month < 10) {
          month = '0' + month;
        }

        return [day, month, year].join('/');
      },
      parse: function (str) {
        const dayMonthYear = str.split('/');
        return new Date(
          dayMonthYear[2],
          dayMonthYear[1] - 1,
          dayMonthYear[0]
        );
      },
      // max: new Date()
    });
  }

  render() {
    const {id, minDate, maxDate, value, required, disabled, placeholder, autoComplete, handleChange, customClassName, wrapperCustomClassName} = this.props;
    const defaultClassName = 'form-control datePicker ';
    const className = customClassName ? (defaultClassName + customClassName) : defaultClassName;

    const defaultWrapperClassName = 'form-group ';
    const wrapperClassName = wrapperCustomClassName ? (defaultWrapperClassName + wrapperCustomClassName) : defaultWrapperClassName;

    return (
      <div className={wrapperClassName}>
        <label>{this.props.label}</label>
        <div className="input-group date">
          {/*<input type="text"
                           className={className}
                           onChange={handleChange}
                           name={name}
                           value={value}
                           key={id}
                           required={required}
                           ref={this.datePickerRef}
                           placeholder={placeholder}/>*/}
          <DatePicker
            className={className}
            key={id}
            id={id}
            locale={langCode}
            selected={value}
            defaultValue={value}
            onChange={handleChange}
            disabled={disabled}
            dateFormat={mask}
            required={required}
            placeholderText={placeholder}
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            // maxDate={new window.Date().getTime()}
            maxDate={maxDate}
            minDate={minDate}
            autoComplete={autoComplete || "off"}
            ref={this.datePickerRef}
          />
        </div>
        {this.props.info && <span className="form-text text-muted">{this.props.info}</span>}
      </div>
    );
  }
}
