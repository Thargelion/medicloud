import React, {Component} from 'react';
import Lottie from "react-lottie";
import successAnimation from './../../lotties/success-check.json';
import failedAnimation from './../../lotties/failed-cross.json';
import locales_es from "../../locales/es";
import {STATUS_SUCCESS} from "../../models/constants";

export default class ModalAnimationResult extends Component {


  render() {
    const {acceptAction, result, titleSuccess, titleFailed} = this.props;
    const animationSize = 150;

    const animationOptions = {
      loop: false,
      autoplay: true,
      animationData: result === STATUS_SUCCESS ? successAnimation : failedAnimation,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    };

    return (
      <>
        <div className="woopi-overlay">
          <div className="woopi-overlay-content">
            <div className="row">
              <div className="col text-center">
                <Lottie
                  options={animationOptions}
                  height={animationSize}
                  width={animationSize}
                />
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-9 text-center">
                {result === STATUS_SUCCESS ?
                  <h4 className="m-3">{titleSuccess || '¡Ha salido todo bien!'}</h4>
                  : <h4 className="m-3">{titleFailed || '¡Hemos tenido un problema!'}</h4>
                }
              </div>
            </div>
            <div className="row justify-content-center mt-3">
              <div className="col-lg-9 text-center">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  acceptAction && acceptAction()
                }} type="button"
                   className="btn btn-outline-brand btn-pill m-1">
                  {locales_es.accept}
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
