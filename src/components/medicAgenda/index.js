import React, {Component} from 'react';
import locales_es from "../../locales/es";
import {
    HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS, HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES,
    HREF_PAGE_MEDIC_EDIT_TIMETABLES, HREF_PAGE_MEDICS,
    USER_TYPE_SECRETARY
} from "../../models/constants";
import APIService from "../../modules/apiService";
import Helpers from "../../modules/helpers";
import ConfigService from "../../modules/configService";
import Modal from "../../components/modal";

export default class MedicAgenda extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false
        };

        this.api = new APIService();
        this.configService = new ConfigService();
        this.helpers = new Helpers();
    }

    unassingMedic() {
        const confirm = window.confirm(locales_es.confirmUnassignMedic);

        if (confirm) {
            this.configService.getLocalClinicData().then(clinic => {
                const objData = {
                    medic_id: this.props.medic.id,
                    clinic_id: clinic.id
                };
                this.api.unassignMedic(objData).then(res => {
                    this.props.showMainModal(locales_es.successModal.title, res.message);
                    this.setState({
                        modalVisible: true
                    });
                }).catch(err => {
                    this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                });
            });
        }
    }

    goBack() {
        this.props.history.replace(HREF_PAGE_MEDICS);
    }

    render() {
        const {medic, userType, hideEditAppointments} = this.props;

        /*const href = userType === USER_TYPE_SECRETARY
            ? `${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${medic.id}`
            : `${HREF_PAGE_DASHBOARD}`;
        const linkText = userType === USER_TYPE_SECRETARY
            ? locales_es.editTimetables
            : locales_es.administrateAppointments;*/
        const href = `${HREF_PAGE_MEDIC_EDIT_TIMETABLES}/${medic.id}`;
        const linkText = locales_es.editTimetables;
        return (
            <>
                {hideEditAppointments ? null :
                    <div className="row">
                        <div className="col text-center p-3">
                            <a href={href}
                               className="btn btn-brand btn-upper btn-bold kt-align-center">{linkText}</a>
                        </div>
                    </div>
                }
                <div className="row">
                    <div className="col text-center p-3">
                        <a href={`${HREF_PAGE_MEDIC_EDIT_NON_WORKING_DAYS}/${medic.id}`}
                           className="btn btn-info btn-upper btn-bold kt-align-center">{locales_es.editNonWorkingDays}</a>
                    </div>
                </div>
                <div className="row">
                    <div className="col text-center p-3">
                        <a href={`${HREF_PAGE_MEDIC_EDIT_SINGLE_TIMETABLES}/${medic.id}`}
                           className="btn btn-outline-brand btn-sm btn-bold btn-upper m-1">{locales_es.editSingleTimetables}</a>
                    </div>
                </div>
                {userType === USER_TYPE_SECRETARY &&
                <>
                    <div className="row">
                        <div className="col text-center p-3">
                            <button onClick={() => this.unassingMedic()}
                                    className="btn btn-danger btn-upper btn-bold kt-align-center">{locales_es.unassignMedic}</button>
                        </div>
                    </div>
                </>
                }

                <Modal onClose={() => this.setState({modalVisible: false})}
                       modalId="unassignMedic"
                       title={locales_es.unassignMedic}
                       hideCloseButton={true}
                       visible={this.state.modalVisible}
                       actions={[
                           {
                               title: locales_es.accept,
                               onClick: () => this.goBack(),
                               className: 'btn btn-outline-info',
                           }
                       ]}
                >
                    {locales_es.unassignedMedic}
                </Modal>
            </>

        )
    }
}
