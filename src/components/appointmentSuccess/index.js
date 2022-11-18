import React, {Component} from 'react';
import Lottie from "react-lottie";
import animationData from './../../lotties/appointment_success';
import locales_es from "../../locales/es";
import AddToCalendarHOC from 'react-add-to-calendar-hoc';
import Button from "./button";
// import CalendarModal from "./modal";
import Dropdown from "./dropdown";

// const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);


export default class AppointmentSuccess extends Component {

    render() {
        const {acceptAction, event} = this.props;
        const animationSize = 150;

        const AddToCalendarDropdown = AddToCalendarHOC(Button, Dropdown);
        // const AddToCalendarDropdown = AddToCalendarHOC(Button, CalendarModal);

        const animationOptions = {
            loop: false,
            autoplay: true,
            animationData: animationData,
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
                                <h4 className="m-3">{locales_es.appointmentSuccess.title}</h4>
                                <div className="kt-timeline d-none d-md-block">
                                    <div className="kt-timeline__item kt-timeline__item--success">
                                        <div className="kt-timeline__item-section">
                                            <div className="kt-timeline__item-section-border">
                                                <div className="kt-timeline__item-section-icon">
                                                    <i className="flaticon-feed kt-font-success"></i>
                                                </div>
                                            </div>
                                            <span className="kt-timeline__item-datetime"><strong>{locales_es.important}: </strong>{locales_es.appointmentSuccess.text1}</span>
                                        </div>
                                        <div className="kt-timeline__item-text">
                                            <br/><strong>{locales_es.appointmentSuccess.text2}</strong>.
                                            <br/>{locales_es.appointmentSuccess.text3}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-md-none">
                                    <div>
                                        <strong>{locales_es.important}: </strong>
                                        {locales_es.appointmentSuccess.text4}
                                        <br/>
                                        <br/>
                                        <strong>{locales_es.appointmentSuccess.text5}</strong>.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center mt-3">
                            <div className="col-lg-9 text-center">
                                <AddToCalendarDropdown
                                    className="m-3"
                                    linkProps={{
                                        className: 'test',
                                    }}
                                    event={event}
                                    buttonText={locales_es.addToCalendar}
                                    // items={isiOS ? [SHARE_SITES.GOOGLE, SHARE_SITES.ICAL, SHARE_SITES.YAHOO] : null}
                                />
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
