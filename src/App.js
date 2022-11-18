import React, {Component} from 'react';
import './App.css';

import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import Rodal from 'rodal';
import MedicsPage from "./pages/medics";
import Header from "./components/header";
import Footer from "./components/footer";
import LoginPage from "./pages/login";
import {
    hrefLogin,
    HREF_PAGE_MY_PROFILE,
    hrefRecovery,
    HREF_REGISTER,
    HREF_PAGE_MEDIC_EDIT_TIMETABLES,
    HREF_PAGE_DASHBOARD,
    HREF_PAGE_TERMS,
    HREF_PAGE_PATIENTS,
    HREF_PAGE_CHANGE_PASSWORD,
    HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS,
    HREF_PAGE_MEDIC,
    HREF_PAGE_ADD_MEDIC,
    HREF_PAGE_ADD_PATIENT,
    HREF_PAGE_ONLINE,
    HREF_PAGE_MY_MEDICS,
    HREF_PAGE_VIDEOCALL,
    HREF_PAGE_MY_MEDIC_PROFILE,
    HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES,
    HREF_PAGE_SETTINGS,
    HREF_PAGE_ADD_CLINIC,
    HREF_PAGE_MEDIC_ADD_TIMETABLE, HREF_REGISTER_PATIENT, HREF_REGISTER_MEDIC,
} from "./models/constants";
import RecoveryPage from "./pages/recovery";
import RegisterPatientPage from "./pages/registerPatient";
import MyProfilePage from "./pages/myProfile";
import MedicPage from "./pages/medic";
import MedicEditTimetablesPage from "./pages/medicEditTimetables";
import DashboardPage from "./pages/dashboard";
import TermsPage from "./pages/terms";
import PatientsPage from "./pages/patients";
import locales_es from "./locales/es";
import ChangePassword from "./pages/changePassword";
import NonWorkingDaysPage from "./pages/nonWorkingDays";
import AddMedicPage from "./pages/addMedic";
import AddPatientPage from "./pages/addPatient";
import OnlinePage from "./pages/online";
import MyMedicsPage from "./pages/myMedics";
import VideocallPage from "./pages/videocall";
import MyMedicProfilePage from "./pages/myMedicProfile";
import MedicEditSingleTimetablesPage from "./pages/medicEditSingleTimetables";
import SettingsPage from "./pages/settings";
import AddClinicPage from "./pages/addClinic";
import ClearCachePage from "./pages/clearCache";
import MedicAddTimetablesPage from "./pages/medicAddTimetables";
import RegisterPage from "./pages/register";
import RegisterMedicPage from "./pages/registerMedic";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPath: 'undefined',
            visible: false,
            modalTitle: '',
            modalContent: '',
            modalActions: null,
            loadingConfig: true
        };

    }

    onChangeRouter() {
        if (this.state.currentPath !== window.location.pathname) {
            this.setState({
                currentPath: window.location.pathname
            });
        }
    }

    /* MODAL Functions */
    showModal(title, content, customStyles, actions) {
        this.setState({modalTitle: title});
        this.setState({modalContent: content});
        this.setState({customStyles});
        this.setState({modalActions: actions});
        console.log(customStyles);
        const regex = /Failed to fetch/igm;
        regex.test(content) ? window.showFailedToFetchModal() : this.show();
    }

    show() {
        this.setState({visible: true});
    }

    hide() {
        this.setState({visible: false});
    }

    //

    render() {

        const {currentPath} = this.state;

        const bodyStdClassName = 'kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default';

        const classNames = {
            'undefined': {
                gridClassName: 'kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page'
            },
            [hrefLogin]: {
                gridClassName: 'kt-grid__item   kt-grid__item--fluid kt-grid  kt-grid kt-grid--hor kt-login-v2'
            },
            [HREF_REGISTER]: {
                gridClassName: 'kt-grid__item   kt-grid__item--fluid kt-grid  kt-grid kt-grid--hor kt-login-v2'
            },
            [hrefRecovery]: {
                gridClassName: 'kt-grid__item   kt-grid__item--fluid kt-grid  kt-grid kt-grid--hor kt-login-v2'
            },
            [HREF_PAGE_VIDEOCALL]: {
                gridClassName: 'full'
            },
        };

        const regexVideocall = new RegExp(HREF_PAGE_VIDEOCALL);

        return (
            <Router onChange={this.onChangeRouter()}>
                <div className={regexVideocall.test(currentPath) ? classNames[HREF_PAGE_VIDEOCALL].gridClassName : bodyStdClassName}>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    {process.env.REACT_APP_ENV_MANTEINANCE_MODE === 'true' ?
                        <div className="kt-grid kt-grid--hor kt-grid--root">
                            <div className={
                                classNames[currentPath]
                                    ? classNames[currentPath].gridClassName
                                    : classNames['undefined'].gridClassName
                            }>

                                {currentPath === hrefLogin || currentPath === HREF_REGISTER || currentPath === hrefRecovery || regexVideocall.test(currentPath)
                                    ? null
                                    : <Header showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}/>
                                }
                                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
                                     id="kt_content">

                                    <div className="kt-container  kt-grid__item kt-grid__item--fluid">
                        <div className="alert alert-warning" role="alert">
                            <div className="alert-text">
                                Estamos trabajando en el sitio. Por favor, accede más tarde para seguir con tus consultas.
                            </div>
                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    :
                        <div className={regexVideocall.test(currentPath)
                            ? classNames[HREF_PAGE_VIDEOCALL].gridClassName : 'kt-grid kt-grid--hor kt-grid--root'}>
                            <div className={
                                regexVideocall.test(currentPath) ? classNames[HREF_PAGE_VIDEOCALL].gridClassName :
                                classNames[currentPath]
                                    ? classNames[currentPath].gridClassName
                                    : classNames['undefined'].gridClassName
                            }>

                                {currentPath === hrefLogin || currentPath === HREF_REGISTER || currentPath === hrefRecovery || regexVideocall.test(currentPath)
                                    ? null
                                    : <Header showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}/>
                                }
                                <div className={regexVideocall.test(currentPath)
                                    ? classNames[HREF_PAGE_VIDEOCALL].gridClassName
                                    : 'kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor'}
                                     id="kt_content">

                                    <div className={regexVideocall.test(currentPath)
                                        ? classNames[HREF_PAGE_VIDEOCALL].gridClassName
                                        :'kt-container  kt-grid__item kt-grid__item--fluid'}>

                                        <Switch>
                                            <Route exact path={hrefLogin} render={
                                                (props) => <LoginPage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={hrefRecovery} render={
                                                (props) => <RecoveryPage {...props}
                                                                         showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_REGISTER} render={
                                                (props) => <RegisterPage {...props}
                                                                         showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_REGISTER_PATIENT} render={
                                                (props) => <RegisterPatientPage {...props}
                                                                         showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_REGISTER_MEDIC} render={
                                                (props) => <RegisterMedicPage {...props}
                                                                         showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_MY_PROFILE} render={
                                                (props) => <MyProfilePage {...props}
                                                                          showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_MY_MEDIC_PROFILE} render={
                                                (props) => <MyMedicProfilePage {...props}
                                                                          showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC_ADD_TIMETABLE}/:id`} render={
                                                (props) => <MedicAddTimetablesPage {...props}
                                                                                    showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/:id`} render={
                                                (props) => <MedicEditTimetablesPage {...props}
                                                                                    showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/:id/:timetableId`} render={
                                                (props) => <MedicEditTimetablesPage {...props}
                                                                                    showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES}/:id`} render={
                                                (props) => <MedicEditSingleTimetablesPage {...props}
                                                                                    showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES}/:id/:timetableId`} render={
                                                (props) => <MedicEditSingleTimetablesPage {...props}
                                                                                    showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS}/:id`} render={
                                                (props) => <NonWorkingDaysPage {...props}
                                                                               showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_DASHBOARD} render={
                                                (props) => <DashboardPage {...props}
                                                                          showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_TERMS} render={
                                                (props) => <TermsPage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_SETTINGS} render={
                                                (props) => <SettingsPage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_PATIENTS} render={
                                                (props) => <PatientsPage {...props}
                                                                         showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={HREF_PAGE_CHANGE_PASSWORD} render={
                                                (props) => <ChangePassword {...props}
                                                                           showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MEDIC}/:id`} render={
                                                (props) => <MedicPage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_MY_MEDICS}`} render={
                                                (props) => <MyMedicsPage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_ONLINE}/:medic_id/:patient_id`} render={
                                                (props) => <OnlinePage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_VIDEOCALL}/:hash`} render={
                                                (props) => <VideocallPage {...props}
                                                                       showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_ADD_MEDIC}`} render={
                                                (props) => <AddMedicPage {...props}
                                                                          showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_ADD_CLINIC}/:medicId`} render={
                                                (props) => <AddClinicPage {...props}
                                                                          showMainModal={(title, content, customStyles) => this.showModal(title, content, customStyles)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_ADD_CLINIC}/:medicId/:clinicId`} render={
                                                (props) => <AddClinicPage {...props}
                                                                          showMainModal={(title, content, customStyles) => this.showModal(title, content, customStyles)}
                                                />
                                            }/>
                                            <Route exact path={`${HREF_PAGE_ADD_PATIENT}`} render={
                                                (props) => <AddPatientPage {...props}
                                                                         showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path="/clear-cache" render={
                                                (props) => <ClearCachePage {...props}
                                                                           showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path={`/:id`} render={
                                                (props) => <MedicPage {...props}
                                                                      showMainModal={(title, content, customStyles, actions) => this.showModal(title, content, customStyles, actions)}
                                                />
                                            }/>
                                            <Route exact path="*" render={
                                                (props) => <MedicsPage {...props}
                                                                        showMainModal={(title, content, customStyles) => this.showModal(title, content, customStyles)}
                                                />
                                            }/>
                                        </Switch>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }


                    {regexVideocall.test(currentPath) ? null : <Footer/>}

                    <Rodal width={window.screen && window.screen.availWidth ? window.screen.availWidth * 0.7 : '300'}
                           customStyles={this.state.customStyles}
                           visible={this.state.visible} onClose={() => this.hide()}>
                        <h4 className="rodal-title">{this.state.modalTitle}</h4>
                        <div className="rodal-body" dangerouslySetInnerHTML={
                            {
                                __html: this.state.modalContent
                            }
                        }/>
                        <div className="rodal-footer">
                            {this.state.modalActions && this.state.modalActions.length ?
                              this.state.modalActions.map(action =>
                                <button className={`${action.class || 'btn btn-primary'}`} type="button"
                                        onClick={() => action.method && action.method() || this.hide()}>{action.label}
                                </button>
                              )
                              :
                              <button className="btn btn-primary" type="button"
                                      onClick={() => this.hide()}>{locales_es.accept}
                              </button>
                            }
                        </div>
                    </Rodal>
                </div>
            </Router>
        );
    }
}

export default App;
