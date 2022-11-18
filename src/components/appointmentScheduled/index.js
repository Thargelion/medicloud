import React, {Component} from 'react';
// import Lottie from "react-lottie";
// import animationData from './../../lotties/appointment_success';
import locales_es from "../../locales/es";
import Spinner from "../spinner";
import Button from "./button";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";


// const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);


export default class AppointmentScheduled extends Component {

  constructor(props) {
    super(props);

    this.state = {
      bankTransferData: null,
    };

    this.api = new APIService();
    this.helpers = new Helpers();
  }

  closeBankTransferData() {
    this.setState({
      bankTransferData: false
    })
  }

  render() {
    // const {event, paymentMethods} = this.props;
    const {paymentMethods, onContinue, onBankTransferClick, onMercadoPagoClick} = this.props;
    // const animationSize = 150;

    /*const animationOptions = {
      loop: false,
      autoplay: false,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };*/

    return (
      <>
        <div className="woopi-overlay">
          <div className="woopi-overlay-content">
            <div className="row d-none d-md-flex">
              <div className="col text-center">
                {/*<Lottie
                  options={animationOptions}
                  height={animationSize}
                  width={animationSize}
                />*/}
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-9 text-center">
                <h4 className="m-4">{locales_es.appointmentScheduled.title}</h4>
                <div className="kt-timeline__item kt-timeline__item--warning">
                  <span className="btn btn-warning btn-elevate btn-circle btn-icon mr-3">
                    <i className="flaticon-signs-2"></i>
                  </span><span
                  className="kt-timeline__item-datetime"><strong>{locales_es.important}: </strong>{locales_es.appointmentScheduled.text1}</span>
                  <div className="kt-timeline__item-text">
                    <br/><strong>{locales_es.appointmentScheduled.text2}</strong>.
                    <br/>
                    <br/>{locales_es.appointmentScheduled.text3}:
                  </div>
                </div>
              </div>
            </div>
            <div className="row justify-content-center mt-3">
              <div className="col-lg-9 text-center">
                {paymentMethods ? paymentMethods.length ?
                  paymentMethods.map((pm, index) => <Button key={'button-' + index} paymentMethod={pm} onContinue={onContinue}
                                                   onBankTransferClick={onBankTransferClick}
                                                   onMercadoPagoClick={onMercadoPagoClick}>{locales_es.gatewayMethodsList[pm.payment_method.tag].label_patient}</Button>)
                  : <div>Ha ocurrido un error. Contactate con el administrador del sitio para que podamos ayudarte</div>
                  : <Spinner/>
                }
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
