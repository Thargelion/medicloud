import React, {Component} from 'react';

export default class Input extends Component {

  togglePasswordVisibility(ev) {
    const target = ev.target.previousSibling;
    const actualType = target.type;
    target.type = actualType === 'password' ? 'text' : 'password';

    const input = ev.target;
    input.classList.toggle('icon-eye__closed');
  }

  getInputByType(params) {
    const {id, value, placeholder, autoComplete, required, disabled, step, min, max, handleChange, customClassName, transform} = this.props;
    const defaultClassName = 'form-control ';
    const className = customClassName ? (defaultClassName + customClassName) : defaultClassName;

    switch (params) {
      case 'password':
        return (
          <>
            <input className={className} type="password"
                   onChange={handleChange}
                   value={value}
                   placeholder={placeholder}
                   autoComplete={autoComplete}
                   key={id}
                   required={required}
                   disabled={disabled}
                   id={id}
            />
            <i onClick={(ev) => this.togglePasswordVisibility(ev)}
               className="icon-eye icon-eye__closed"></i>
            {this.props.advice &&
            <span className="form-text text-muted">{this.props.advice}</span>
            }
          </>
        );
      case 'number':
        return (
          <>
            <input className={className} type={params}
                   onChange={handleChange}
                   value={value}
                   placeholder={placeholder}
                   autoComplete={autoComplete}
                   key={id}
                   required={required}
                   disabled={disabled}
                   step={step}
                   min={min}
                   max={max}
            />
          </>
        );
      case 'textarea':
        return (
          <>
            <textarea className={className}
                      onChange={handleChange}
                      value={value}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      key={id}
                      required={required}
                      disabled={disabled}
                      style={{
                        resize: 'none'
                      }}
            />
          </>
        );
      default:
        return (
          <>
            <input className={className} type={params}
                   onChange={handleChange}
                   value={transform ? transform(value) : value}
                   placeholder={placeholder}
                   autoComplete={autoComplete}
                   key={id}
                   required={required}
                   disabled={disabled}
            />
            {this.props.children}
          </>
        );
    }
  }

  render() {
    const {wrapperCustomClassName} = this.props;
    const defaultWrapperClassName = 'form-group ';
    const wrapperClassName = wrapperCustomClassName ? (defaultWrapperClassName + wrapperCustomClassName) : defaultWrapperClassName;
    return (
      <div className={wrapperClassName}>
        <label>{this.props.label} {this.props.required ? '*' : ''}</label><br/>
        {this.getInputByType(this.props.type)}
        {this.props.info && <span className="form-text text-muted">{this.props.info}</span>}
      </div>
    );
  }
}
