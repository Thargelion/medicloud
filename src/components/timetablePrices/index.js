import React, {Component} from 'react';
import './styles.css';
import locales_es from "../../locales/es";
import Form from "../form";

const priceTemplate = [
  {
    label: locales_es.price,
    placeholder: locales_es.pricePlaceholder,
    id: 1,
    state: 'price',
    value: '',
    type: 'number',
    required: true,
    wrapperCustomClassName: 'form-group col-md-2 float-left pl-md-0',
  },
  {
    label: locales_es.priceTitle,
    placeholder: locales_es.priceTitlePlaceholder,
    id: 2,
    state: 'title',
    value: '',
    type: 'text',
    required: true,
    wrapperCustomClassName: 'form-group col-md-5 float-left pl-md-0',
  },
  {
    label: locales_es.priceDescription,
    placeholder: locales_es.priceDescriptionPlaceholder,
    id: 3,
    state: 'description',
    value: '',
    type: 'text',
    required: true,
    wrapperCustomClassName: 'form-group col-md-5 float-left pl-md-0',
  }
]

export default class TimetablePrices extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prices: this.props.prices && this.props.prices.length ? this.props.prices : []
    }
  }

  addPrice() {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    prices.push(priceTemplate);
    this.setState({
      prices,
    })
  }

  removePrice() {
    const prices = JSON.parse(JSON.stringify(this.state.prices));
    prices.pop();
    this.setState({
      prices,
    })
  }

  handleChangePrices = (state, formIndex) => (ev) => {
    const prices = JSON.parse(JSON.stringify(this.state.prices));

    for (const [primaryKey, primaryValue] of Object.entries(prices[formIndex])) {
      if (primaryValue.state === state) {
        prices[formIndex][primaryKey].value = ev.target.value;
      }
    }
    this.setState({
      prices
    });
    this.props.onChange(prices);
  };

  render() {
    const {wrapper, styles, label, required, info, emptyText} = this.props;
    const {prices} = this.state;

    return (
      <div className={wrapper ? 'kt-portlet__body' : ''}>
        <div className={styles}>
          <div className="woopi-timetable-prices">
            <h4>{label} {required ? '*' : ''}</h4><br/>
            {info && <span className="form-text text-muted">{info}</span>}
            {prices && prices.length ?
              prices.map((price, index) => <Form
                formIndex={index}
                styles="woopi-timetable-price"
                key={'price-form-' + index}
                inputs={price}
                handleChange={this.handleChangePrices}
              />)
              : emptyText && <span className="form-text text-muted">{emptyText}</span>}
            <div className="woopi-timetable-prices--buttons">
              <button onClick={() => this.removePrice()} type="button" className="btn btn-danger btn-elevate btn-circle btn-icon">
                <i className="fa fa-2x fa-minus" />
              </button>
              <button onClick={() => this.addPrice()} type="button" className="btn btn-brand btn-elevate btn-circle btn-icon">
                <i className="fa fa-2x fa-plus" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
