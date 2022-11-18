import React, {Component} from "react";
import locales_es from "../../locales/es";
import AuthService from "../../modules/authService";
import {HREF_PAGE_MEDIC, USER_TYPE_MEDIC} from "../../models/constants";

export default class MedicCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userData: null
        };

        this.auth = new AuthService();
    }

    componentDidMount() {
        this.auth.getRemoteUserData().then(res => {
            if (res && res.data && res.data.user) {
                this.setState({
                    userData: res.data.user
                })
            }
        })
    }


    render() {
        const {userData} = this.state;
        return (
            <>
                {this.auth.getLocalUserType() === USER_TYPE_MEDIC &&
                <>
                    <div className="row">
                        <div className="col text-center">
                            {locales_es.shareYourProfileToYourPatients}
                        </div>
                    </div>
                    <div className="row justify-content-center mt-3 mb-3">
                        <div className="col-lg-4">

                            <a href={`${HREF_PAGE_MEDIC}/${this.auth.getUserData().user.id}`}
                               className="kt-portlet">
                                {userData &&
                                <div className="kt-portlet__body">
                                    <div className="kt-section">
                                        <div
                                            className="kt-user-card kt-margin-b-50 kt-margin-b-30-tablet-and-mobile"
                                            style={{backgroundColor: '#9816f4'}}>
                                            <div className="kt-user-card__wrapper">
                                                <div className="kt-user-card__pic">
                                                    <img alt="Pic"
                                                         src={userData.full_profile_image}/>
                                                </div>
                                                <div className="kt-user-card__details">
                                                    <div className="kt-user-card__name">
                                                        {userData.name} {userData.lastname}
                                                    </div>
                                                    <div
                                                        className="kt-user-card__position">{locales_es.yourMedicProfile}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                }
                            </a>
                        </div>
                    </div>
                </>
                }

            </>
        )
    }
}
