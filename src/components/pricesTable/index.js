import React, {Component} from 'react';
import locales_es from "../../locales/es";

export default class PricesTable extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {prices, onRemove, onEdit} = this.props;

        return (
          <div className="kt-section">
              <div className="kt-section__content">
                  <table className="table table-head-noborder">
                      <thead>
                          <tr>
                              <th>{locales_es.price}</th>
                              <th>{locales_es.title}</th>
                              <th>{locales_es.description}</th>
                              <th>{locales_es.actions}</th>
                          </tr>
                      </thead>
                      <tbody>
                      {prices && prices.length ?
                        prices.map((p, i) =>
                          <tr key={'price-table-row-' + i}>
                              <th className="align-middle">{locales_es.currency_sign}{p.price}</th>
                              <td className="align-middle">{p.title}</td>
                              <td className="align-middle">{p.description}</td>
                              <td className="align-middle">
                                  <button onClick={() => onEdit(p, i)} type="button"
                                        className="btn btn-sm btn-focus btn-elevate btn-pill btn-brand m-1">
                                      <i className="flaticon-edit p-0"/>
                                  </button>
                                  <button onClick={() => onRemove(p, i)} type="button"
                                          className="btn btn-sm btn-focus btn-elevate btn-pill btn-danger m-1">
                                      <i className="flaticon-delete p-0"/>
                                  </button>
                              </td>
                          </tr>
                        )
                        : null}
                      </tbody>
                  </table>
              </div>
          </div>
        )
    }
}
