import React, {Component} from 'react';
import AuthService from "../../modules/authService";
import Spinner from "../../components/spinner";
import {
  HREF_PAGE_HOME, STATUS_FAILED,
  STATUS_SUCCESS,
  USER_TYPE_MEDIC,
  USER_TYPE_PATIENT,
  USER_TYPE_SECRETARY
} from "../../models/constants";
import DashboardPatient from "../../components/dashboardPatient";
import DashboardMedic from "../../components/dashboardMedic";
import DashboardSecretary from "../../components/dashboardSecretary";
import ModalAnimationResult from "../../components/modalAnimationResult";

export default class DashboardPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      result: null,
    };
    this.auth = new AuthService();

    if (this.props.location &&
      this.props.location.search &&
      window.URLSearchParams &&
      new window.URLSearchParams(this.props.location.search).get("result")) {
      setTimeout(() => {
        this.setState({
          result: new window.URLSearchParams(this.props.location.search).get("result")
        })
      }, 3000);
    }
  }

  componentWillMount() {
    this.checkUserStatus();
  }

  async checkUserStatus() {
    const isLoggedIn = await this.auth.isLoggedUser();
    if (!isLoggedIn) {
      window.location.href = HREF_PAGE_HOME;
    }
  }

  render() {
    const {result} = this.state;
    const userData = this.auth.getUserData();
    return (
      <>
        {userData && userData.user ?
          userData.user.user_type === USER_TYPE_PATIENT &&
          <DashboardPatient history={this.props.history} showMainModal={this.props.showMainModal} location={this.props.location}/> ||
          userData.user.user_type === USER_TYPE_SECRETARY &&
          <DashboardSecretary showMainModal={this.props.showMainModal}/> ||
          userData.user.user_type === USER_TYPE_MEDIC &&
          <DashboardMedic location={this.props.location} showMainModal={this.props.showMainModal}/>
          : <Spinner/>}

        {result && (result === STATUS_SUCCESS || result === STATUS_FAILED) ?
          <ModalAnimationResult
            acceptAction={() => this.setState({result: null})}
            result={result}
          />
          : null
        }
      </>
    )
  }
}
