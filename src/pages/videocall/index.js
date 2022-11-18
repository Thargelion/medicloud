import React, {Component} from "react";
import APIService from "../../modules/apiService";
import locales_es from "../../locales/es";
import Helpers from "../../modules/helpers";
import AuthService from "../../modules/authService";
import 'react-tiny-fab/dist/styles.css';
import AgoraVideoCall from "../../components/AgoraVideoCall";
import "./index.css";
import {hrefLogin, USER_TYPE_MEDIC} from "../../models/constants";
import ConfigService from "../../modules/configService";
import Spinner from "../../components/spinner";
import SideOverlayModal from "../../components/sideOverlayModal";
import OnlinePage from "../online";
import DateTimeService from "../../modules/DateTimeService";


export default class VideocallPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            userData: {},
            hash: props.match.params.hash,
            venueLogo: '',
            venueName: '',
            venueAppointmentWebUrl: '',
            appId: '',
            channelName: '',
            token: '',
            uid: undefined,
            exit: false,
            medicId: null,
            patientId: null,
            provider: 'agora',
        };

        this.videoProfile = "480p_4";
        this.transcode = "rtc";
        this.attendeeMode = "video";
        this.baseMode = "avc";
        /*if (!this.appId) {
            return alert("Get App ID first!");
        }*/
        // this.uid = undefined;

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.configService = new ConfigService();
        this.dateTimeService = new DateTimeService();

        this.endTime = new Date();
        this.endTime.setSeconds(this.endTime.getSeconds() + 10);
    }

    componentDidMount() {
        this.checkUserStatus();
        const isLoggedIn = this.auth.isLoggedUser();
        this.setState({
            isLoggedIn
        }, this.setMenu);
        this.load();
        this.setClinic();
    }

    load() {
        this.api.getVideocallData(this.state.hash).then(res => {
            this.setState({
                appId: res.data.agora_app_id,
                channelName: res.data.channel_name,
                token: res.data.token,
                externalVideocallUrl: res.data.external_videocall_url,
                provider: res.data.provider,
                videocallUrl: res.data.videocall_url,
                appointment: res.data.appointment,
                // uid: res.data.uid,
            })
        }).catch(err => {
            if (err === '401') {
                window.location.href = `${hrefLogin}?redirect=${window.location.pathname}`;
            } else {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            }
        });

        this.api.getMedicPatientBoundingByHash(this.state.hash).then(res => {
            this.setState({
                medicId: res.data.medic_id,
                patientId: res.data.patient_id
            }, () => {
                window.initProfile(); // Intentamos mejorar el boton de Chat que a veces no responde. TODO Improve
            })
        }).catch(err => {
            if (err === '401') {
                return;
            }
            this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
        })
    }

    checkUserStatus() {
        this.auth.checkLoginStatusAndDoSomethingOrDefault(this.handleLoginHeader, this.handleLogoutHeader);
    }

    // Use a class arrow function (ES7) for the handler. In ES6 you could bind()
    // a handler in the constructor.
    handleLoginHeader = () => {
        this.setState({isLoggedIn: true}, () => this.setMenu());
    };

    handleLogoutHeader = () => {
        this.setState({isLoggedIn: false}, () => this.setMenu());
    };

    setMenu() {
        if (this.state.isLoggedIn) {
            this.auth.getRemoteUserData().then(res => {
                if (res && res.data && res.data.user) {
                    this.setState({
                        userData: res.data.user,
                    }, () => {
                        window.initProfile();
                    })
                }
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                window.initProfile();
            });
        }
    }

    showLogoutModal() {
        this.showModal(locales_es.logoutModal.title, locales_es.logoutModal.subtitle);
    }

    logout() {
        this.auth.logout(true);
        this.hide();
        // this.toggleMenu();
    }

    setClinic() {
        this.configService.getLocalClinicData().then(res => {
            console.log(res);
            this.setState({
                venueLogo: res['full_image'],
                venueName: res['name'],
                venueAppointmentWebUrl: res['appointment_web_url'],
            }, () => this.setHTMLTitle());
        }).catch(err => {
            console.log(err);
        });
    }

    setHTMLTitle() {
        const title = document.getElementById('html-title');
        if (title) {
            title.innerHTML = this.state.venueName;
        }
    }

    onExit() {
        this.setState({
            exit: true
        })
    }

    initCall() {

        this.setState({
            userAcceptedCall: true,
        });

        if (this.state.provider === 'daily') {
            const callFrame = window.DailyIframe.createFrame({
                showLeaveButton: true,
                iframeStyle: {
                    position: 'fixed',
                    width: '100%',
                    height: 'calc(100% - 50px)',
                    zIndex: 1,
                    top: '48px',
                    border: 'none',
                },
                /*config: {
                    "hide_daily_branding":false,
                    "redirect_on_meeting_exit": "https://your-domain.co/vid-exit",
                    "hipaa":false,
                    "intercom_auto_record":false,
                    "lang":"en"
                }*/
            });
            // callFrame.setUserName('TESTING');
            callFrame.join({url: this.state.videocallUrl});
            console.log(callFrame);
        }

    }

    initializeCountdown() {
        const countdown = document.getElementById('countdown');
        const clock = document.getElementById('clock');
        const appointment = this.state.appointment;
        if (countdown && clock && appointment && appointment.end) {
            const timeinterval = setInterval(() => {
                const t = this.dateTimeService.getTimeRemaining(appointment.end);
                if (Number(t.days) < 1 && Number(t.hours) < 1 && Number(t.minutes) <= 10) {
                    countdown.classList.remove('d-none');
                    countdown.classList.add('moveIn');
                    clock.innerHTML = t.minutes + ':' + t.seconds;
                }
                if (t.total <= 0) {
                    clearInterval(timeinterval);
                }
            }, 1000);
        }
    }

    render() {
        const {
            venueName,
            venueLogo,
            venueAppointmentWebUrl,
            appId,
            channelName,
            token,
            uid,
            exit,
            medicId,
            patientId,
            isLoggedIn,
            externalVideocallUrl,
            userAcceptedCall,
            provider,
            userData,
            videocallUrl,
        } = this.state;
        return (
            <>
                <div id="countdown" className="countdown text-center d-none">
                    <div className="inner-countdown">
                        <h6>{locales_es.appointmentTimeRemaining}</h6>
                        <h5><span id="clock"></span></h5>
                    </div>
                    {
                        this.initializeCountdown()
                    }
                </div>
                <div className="full">
                    <div className="wrapper meeting">


                        <div className="ag-header">
                            <div className="ag-header-lead">
                                {venueLogo && venueAppointmentWebUrl &&
                                <a href={venueAppointmentWebUrl}>
                                    <img
                                        className="header-logo"
                                        alt={venueName} src={venueLogo}
                                    />
                                </a>
                                }
                            </div>

                            {isLoggedIn && patientId && medicId ?
                                <div className="ag-header-msg">
                                    <a className="btn btn-brand  btn-upper btn-bold kt-inbox__compose"
                                       id="kt_offcanvas_toolbar_profile_toggler_btn">
                                        <i className="flaticon2-send-1 d-none d-sm-inline-block"/> {locales_es.chat}
                                    </a>

                                    <SideOverlayModal title={locales_es.chat} style={{color: '#333'}}>
                                        <OnlinePage patientId={patientId}
                                                    medicId={medicId}
                                                    showToast={true}
                                                    customWrapperClassname={'woopi-chat-wrapper__videocall'}/>
                                    </SideOverlayModal>
                                </div>
                                : null}
                        </div>
                        <div className="ag-main">
                            <div id="audioTroubleMsg" className="w-100 text-center p-5 d-none" style={{
                                position: 'absolute',
                                zIndex: 10,
                            }}>
                                <a className="btn btn-sm btn-label btn-bold m-3"
                                   id="audioTroubleLink"
                                   href="#"
                                   target="_blank"><i className="flaticon-warning"/> {locales_es.resumePlayback}</a>
                                <p style={{
                                    color: '#ccc'
                                }}>{locales_es.ifYouStillFacingIssues}, <a style={{
                                    color: '#fff'
                                }} href="javascript:window.location.reload();">{locales_es.refreshThisPage}.</a></p>
                            </div>
                            <div
                                className={(channelName && appId && token) || videocallUrl ? 'ag-container-agora' : 'ag-container d-flex align-items-center'}>
                                {externalVideocallUrl ?
                                    <div className="ag-container-in">
                                        <h3>{locales_es.externalVideocallTitle}</h3>
                                        <a className="btn btn-sm btn-label btn-bold mt-3"
                                           href={externalVideocallUrl}
                                           target="_blank">{locales_es.enterVideocall}</a>
                                    </div>
                                    : exit ?
                                        <div style={{textAlign: 'center', marginTop: '60px'}}>
                                            <h3>{locales_es.thanksForUsingOurServices}</h3>
                                            <a className="btn btn-sm btn-label btn-bold mt-3"
                                               href="https://forms.gle/Qk5nKkwnz7geDC8x7"
                                               target="_blank">{locales_es.qualifyService}</a>
                                        </div>
                                        :
                                        (channelName && appId && token) || videocallUrl ?
                                            !userAcceptedCall ?
                                                <div className="ag-container-in">
                                                    <h3>{locales_es.joinVideocallTitle}</h3>
                                                    <a className="btn btn-sm btn-label btn-bold mt-3"
                                                       onClick={() => this.initCall()}
                                                       target="_blank">{locales_es.joinVideocallPrejoin}</a>
                                                </div>
                                                :
                                                provider === 'agora' ?
                                                    <AgoraVideoCall
                                                        appId={appId}
                                                        channel={channelName}
                                                        token={token}
                                                        uid={uid}
                                                        videoProfile={this.videoProfile}
                                                        transcode={this.transcode}
                                                        attendeeMode={this.attendeeMode}
                                                        baseMode={this.baseMode}
                                                        onExit={() => this.onExit()}
                                                        userData={userData}
                                                        otherUserId={
                                                            this.state.userData &&
                                                            this.state.userData.user_type === USER_TYPE_MEDIC
                                                                ? this.state.patientId : this.state.medicId
                                                        }
                                                    /> :
                                                    <div className="ag-container-in lateFadeIn">
                                                        <h3>{locales_es.thanksForUsingOurServices}</h3>
                                                    </div>
                                            :
                                            <Spinner/>
                                }
                            </div>
                        </div>
                        <div className="ag-footer justify-content-center">
                            <a className="ag-href" href="https://www.medicloud.com.ar">
                                <span>Powered By Medicloud</span>
                            </a>
                            &nbsp;
                            <div className="kt-footer__copyright float-right">v{process.env.REACT_APP_VERSION}</div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
