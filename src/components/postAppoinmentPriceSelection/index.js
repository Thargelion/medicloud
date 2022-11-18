import React, {Component} from 'react';
// import Lottie from "react-lottie";
// import animationData from './../../lotties/appointment_success';
import locales_es from "../../locales/es";
import Spinner from "../spinner";

// const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);


export default class PostAppoinmentPriceSelection extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    // const {event, prices} = this.props;
    const {prices} = this.props;

    return (
      <>
        <div className="woopi-overlay woopi-price-selection">
          <div className="woopi-overlay-content">
            <div className="row justify-content-center">
              <div className="col text-center">
                <h4 className="m-4">{locales_es.pickConsultationType}</h4>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col">
                {prices ? prices.length ?
                    prices.map((pm, index) =>
                      <div onClick={() => this.props.onPress(pm.id)} key={"price-selection-" + index} className="row woopi-price-selection--container">
                        <div className="col-3 text-center woopi-price-selection--price">
                          {locales_es.currency_sign}{pm.price}
                        </div>
                        <div className="col">
                          <p className="font-weight-bold">{pm.title}</p>
                          <p>{pm.description}</p>
                        </div>
                        <div className="col-1 text-center">
                          <i className="fa fa-chevron-right"/>
                        </div>
                      </div>
                    )
                  : <div>Ha ocurrido un error. Contactate con el administrador del sitio para que podamos ayudarte</div>
                  : <Spinner/>
                }
              </div>
            </div>
            <div className="row mt-3">
              <div className="col text-center">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  this.props.onCancel();
                }}>{locales_es.cancel}</a>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
