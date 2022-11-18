import React, {Component} from "react";
import APIService from "../../modules/apiService";
import Spinner from "../../components/spinner";
import locales_es from "../../locales/es";
import Helpers from "../../modules/helpers";
// import { GiftedChat } from 'react-native-gifted-chat'
import {GiftedChat} from 'react-web-gifted-chat';
// import 'moment';
import 'moment/locale/es';
import AuthService from "../../modules/authService";
import {Fab, Action} from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';
import {
    HREF_PAGE_VIDEOCALL, hrefLogin,
    USER_TYPE_MEDIC,
    USER_TYPE_PATIENT,
} from "../../models/constants";
import "./index.css";
import Loading from "../../components/loading";
import DateTimeService from "../../modules/DateTimeService";
import ConfigService from "../../modules/configService";

const interval = 5000;

const loadingMessages = {
    id: 0,
    text: locales_es.loading,
    createdAt: new Date(),
    system: true,
};

const noMessages = {
    id: 0,
    text: locales_es.thereIsNoMessagesInThisChat,
    createdAt: new Date(),
    system: true,
};

export default class OnlinePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            medicId: this.props.medicId || Number(props.match.params.medic_id),
            patientId: this.props.patientId || Number(props.match.params.patient_id),
            medicPatientId: null,
            messages: [loadingMessages],
            userId: 0,
            userType: '',
            otherUserInfo: null,
            loading: false,
            clinicId: null,
            //imagePreview: mockedImage,
        };

        this.api = new APIService();
        this.helpers = new Helpers();
        this.auth = new AuthService();
        this.dateTimeService = new DateTimeService();
        this.configService = new ConfigService();
    }

    setLoading(bool) {
        this.setState({
            loading: bool
        });
    }

    componentDidMount() {
        this.checkUserStatus();
        const isLoggedIn = this.auth.isLoggedUser();
        this.setState({
            isLoggedIn
        }, this.setMenu);
        this.setClinic();
        isLoggedIn ? this.initialLoad() : window.location.href = `${hrefLogin}?redirect=${window.location.pathname}`;
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

    setClinic() {
        this.configService.getLocalClinicData().then(res => {
            this.setState({
                venueLogo: res['full_image'],
                venueName: res['name'],
                venueAppointmentWebUrl: res['appointment_web_url'],
                clinicId: res['id'],
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

    initialLoad() {
        this.setState({
            userId: this.auth.getUserData().user.id,
            userType: this.auth.getUserData().user.user_type,
        }, () => {
            this.api.getMedicPatientBounding({
                medic_id: this.state.medicId,
                patient_id: this.state.patientId,
            }).then(res => {
                this.setState({
                    medicPatientId: res.data.id
                }, () => {
                    this.load();
                })
            }).catch(err => {
                if (err === '401') {
                    window.location.href = `${hrefLogin}?redirect=${window.location.pathname}`;
                    return;
                }
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
            this.getOtherUserInfo();
        });
    }

    loadInputFilePreview() {
        const input = document.getElementById('file');
        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = (e) => {
                // $('#blah').attr('src', e.target.result);
                // this.messageImage = e.target.result;
                console.log(e.target.result);
                this.setState({
                    imagePreview: e.target.result
                })
                /*const filePreview = document.getElementById('filePreview');
                filePreview.src = e.target.result;*/
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    clickInputFile() {
        const input = document.getElementById('file');
        input.click();
    }

    sendImage() {
        const input = document.getElementById('file');
        const files = input.files;
        const file = files[0];
        this.setLoading(true);

        this.api.sendImageMessage(file, this.state.medicPatientId).then(() => {
            this.setLoading(false);
            this.clearImagePreview();
        }).catch(() => {
            this.setLoading(false);
            this.props.showMainModal(locales_es.errorModal.title, locales_es.errorModal.sendImageError);
            this.clearImagePreview();
        })

    }

    clearImagePreview() {
        this.setState({
            imagePreview: null
        });
    }

    cancelSendImage() {
        this.setState({
            imagePreview: null
        });
        document.getElementById('file').value = '';
    }

    getOtherUserInfo() {
        this.api.getUserById(this.state.userType === USER_TYPE_MEDIC ? this.state.patientId : this.state.medicId).then(res => {
            this.setState({
                otherUserInfo: res.data
            })
        }).catch(err => {
            this.setState({
                otherUserInfo: false
            });
            console.log(err);
        })
    }

    onMessagePress(msgData) {
        alert('soon');
        console.log(msgData)
    }

    checkNewMessages() {
        const messages = JSON.parse(JSON.stringify(this.state.messages));
        messages.map(msg => {
            const timeRemaining = this.dateTimeService.getTimeRemaining(msg.createdAt, true);
            if (timeRemaining.days >= -1 && timeRemaining.minutes >= -1 && timeRemaining.seconds >= -5 && msg.user.id !== this.state.userId) {
                this.showToast();
            }
        });
    }

    showToast() {
        window.$('#online-toast').appendTo(window.$('body'));
        window.$('#online-toast').toast('show');
    }

    getMessages() {
        this.api.getMessages(this.state.medicPatientId).then(res => {
            if (res.data && res.data.length) {
                const messages = res.data.map(msg => {
                    // TODO DEBUG
                    /*msg.data = {
                      page: 'VideoCallScreen',
                      viewData: {
                          consultationId: 1
                      }
                  };*/
                    return {
                        id: msg.id,
                        data: msg.data,
                        text: msg.msg,
                        createdAt: new Date(msg.created_at),
                        // createdAt: new Date(moment(msg.created_at, "YYYY-MM-DDThh:mm:ssZ")),
                        system: false,
                        image: msg.full_image || '',
                        video: msg.full_video || '',
                        user: {
                            id: msg.user.id,
                            name: msg.user.name + ' ' + msg.user.lastname,
                            avatar: msg.user.full_profile_image,
                        }
                    };
                });
                this.setState({
                    messages
                }, () => this.props.showToast && this.checkNewMessages());
            } else {
                this.setState({
                    messages: [noMessages],
                });
            }

        }).catch(err => {
            // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            console.log(err);
            this.unload();
            setTimeout(() => this.load(), (interval * 5))
        })
    }

    onSend(messages = []) {
        /*this.setState((previousState) => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }));*/

        if (messages.length && messages[(messages.length - 1)].text) {
            const text = messages[(messages.length - 1)].text;
            /*this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, messages),
            }));*/
            this.api.postMessage(text, this.state.medicPatientId, this.state.clinicId).then(() => {
                this.getMessages();
            }).catch(err => {
                this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
            });
        } else {
            console.log('No se encontró el texto del mensaje.');
        }
    }

    load() {
        // this.getMessages(); // DEBUG
        this.listener = setInterval(() => this.getMessages(), interval);
        console.log('connected');
    }

    unload() {
        clearInterval(this.listener);
        console.log('disconnected');
    }

    initVideoCall() {
        // this.props.history.push()
        window.open(window.location.origin + HREF_PAGE_VIDEOCALL + '/' + this.state.medicPatientId, '_blank');
    }

    handleUrlPress(link) {
        window.open(link, '_blank');
    }

    render() {
        const {medicPatientId, otherUserInfo, loading} = this.state;
        const {customWrapperClassname} = this.props;

        const classname = 'woopi-chat-wrapper';
        const classnameModifier = 'woopi-chat-wrapper__online-page';
        return (
            medicPatientId === null ?
                <Spinner/>
                : medicPatientId ?
                <>
                    {loading && <Loading/>}
                    <div className={customWrapperClassname
                        ? (classname + ' ' + customWrapperClassname)
                        : (classname + ' ' + classnameModifier)}>
                        {otherUserInfo === null ? <Spinner/>
                            : otherUserInfo ?
                                <div className="kt-widget-15 woopi-chat-other-user-card">
                                    <div className="kt-widget-15__body">
                                        <div className="kt-widget-15__author">
                                            <div className="kt-widget-15__photo">
                                                <img src={otherUserInfo.full_profile_image}/>
                                            </div>
                                            <div className="kt-widget-15__detail">
                                                <a href="#"
                                                   className="kt-widget-15__name">{otherUserInfo.name} {otherUserInfo.lastname}</a>
                                                {otherUserInfo.user_type === USER_TYPE_PATIENT && <div>
                                                    {
                                                        otherUserInfo.email &&
                                                        <a href={`mailto:${otherUserInfo.email}`}><i
                                                            className="flaticon2-send kt-font-success"/> {otherUserInfo.email}
                                                        </a>
                                                    }
                                                    {
                                                        otherUserInfo.email && otherUserInfo.cellphone &&
                                                        <span> | </span>
                                                    }
                                                    {otherUserInfo.cellphone &&
                                                    <a href={`tel:${otherUserInfo.cellphone}`}><i
                                                        className="fa fa-phone-square"/> {otherUserInfo.cellphone}</a>
                                                    }
                                                </div>
                                                }
                                                {otherUserInfo.email || otherUserInfo.cellphone ? null
                                                    :
                                                    <div className="kt-widget-15__desc">
                                                        {otherUserInfo.user_type === USER_TYPE_PATIENT ? locales_es.patient : null}
                                                        {otherUserInfo.user_type === USER_TYPE_MEDIC ? locales_es.medic : null}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                : null
                        }
                        <GiftedChat
                            messages={this.state.messages}
                            onSend={(messages) => this.onSend(messages)}
                            locale="es"
                            alwaysShowSend={true}
                            placeholder={(locales_es.writeAMessage + '...')}
                            renderUsernameOnMessage={true}
                            showUserAvatar={true}
                            user={{
                                id: this.state.userId,
                            }}
                            label={locales_es.send}
                            parsePatterns={
                                () => [{
                                    type: 'url',
                                    style: {textDecorationLine: 'underline'},
                                    onPress: this.handleUrlPress
                                }]
                            }
                            // renderSend={() => <button className="btn btn-brand btn-upper"><i className="flaticon2-send-1"></i></button>}
                        />
                    </div>

                    <Fab
                        actionButtonStyles={{}}
                        mainButtonStyles={{background: 'rgba(255, 184, 34, 0.5)', color: '#ffb822'}}
                        style={{
                            position: 'absolute',
                            bottom: '40px',
                            right: '0',
                        }}
                        icon={<i className="flaticon2-add-1"/>}
                        event={'click'}
                        alwaysShowTitle={true}
                        //onClick={() => alert('click')}
                    >
                        {/*<Action
                                style={{
                                    background: 'rgba(28, 172, 129, 1)',
                                    // color: '#1cac81',
                                    color: '#fff',
                                }}
                                text={locales_es.initVideocall}
                                onClick={() => this.initVideoCall()}
                            >
                                <i className="flaticon-laptop"/>
                            </Action>*/}
                        <Action
                            style={{
                                color: '#DCE4FB',
                                // color: '#1cac81',
                                background: '#5578EB',
                                fontSize: '20px',
                            }}
                            text={locales_es.sendImage}
                            onClick={() => this.clickInputFile()}
                        >
                            <i className="flaticon-attachment"/>
                        </Action>
                    </Fab>

                    {this.state.imagePreview &&
                    <div className="woopi-chat-preview">
                        <div className="woopi-chat-preview-header">
                            <a className="woopi-chat-preview-close" onClick={() => this.cancelSendImage()}>
                                <i className="flaticon2-delete"></i></a>
                            <span className="woopi-chat-preview-title">{locales_es.preview}</span>
                        </div>
                        <div className="woopi-chat-preview-image">
                            <img src={this.state.imagePreview}/>
                        </div>
                        <div className="woopi-chat-preview-footer">
                            <button onClick={() => this.sendImage()}
                                    className="btn btn-brand btn-upper"><i
                                className="flaticon2-send-1"/>{locales_es.send}</button>
                            &nbsp;
                            <button onClick={() => this.cancelSendImage()}
                                    className="btn btn-danger btn-upper"><i
                                className="flaticon-cancel"/>{locales_es.cancel}</button>
                        </div>
                    </div>
                    }

                    <input accept="image/jpeg, image/gif, image/png"
                           type="file" className="d-none" id="file" onChange={() => this.loadInputFilePreview()}/>

                    <div className="toast toast-custom toast-fill fade hide" role="alert" aria-live="assertive"
                         aria-atomic="true" id="online-toast" data-delay="4000">
                        <div className="toast-header">
                            <i className="toast-icon flaticon2-attention kt-font-danger"></i>
                            <span className="toast-title">{locales_es.youGotNewMessage}</span>
                            {/*<small className="toast-time">11 mins ago</small>*/}
                        </div>
                        <div className="toast-body">{locales_es.openChatToSeeMessages}</div>
                    </div>
                </>
                :
                <h2>{locales_es.medicPatientBindingNotFound}</h2>
        )
    }
}
