import React, {Component} from 'react';


export default class FormSelect extends Component {

    render() {
        const {id,
          name,
          value,
          required,
          disabled,
          options,
          handleChange,
          customClassName,
          wrapperCustomClassName,
          primaryAction,
          secondaryAction,
          children,
        } = this.props;
        const defaultClassName = 'form-control kt_selectpicker ';
        const className = customClassName ? (defaultClassName + customClassName) : defaultClassName;

        const defaultWrapperClassName = 'form-group ';
        const wrapperClassName = wrapperCustomClassName ? (defaultWrapperClassName + wrapperCustomClassName) : defaultWrapperClassName;

        return (
            <div className={wrapperClassName}>
                <label>{this.props.label}</label>
                <select className={className}
                        onChange={handleChange}
                        name={name}
                        value={value}
                        key={id}
                        disabled={disabled}
                        required={required}>
                    {options && options.length ? options.map(opt => {
                        return (
                            <option key={'opt_' + (opt.id || opt.value)} id={(opt.id || opt.value)} value={(opt.id || opt.value)}
                                    name={opt.name}>{opt.name}</option>
                        )
                    }) : null}
                </select>
                <div className="row">
                    {primaryAction && <span className="pt-3 col-6">{primaryAction}</span>}
                    {secondaryAction && <span className="pt-3 col-6 text-right">{secondaryAction}</span>}
                </div>
                {children}
            </div>
        );
    }
}
