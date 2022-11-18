import React, {Component} from "react";
import locales_es from "../../locales/es";
import DateTimeService from "../../modules/DateTimeService";
import "./styles.css";
import {EMAIL_REMINDER_STATUS_OPENED, EMAIL_REMINDER_STATUS_SENT} from "../../models/constants";

export default class Schedules extends Component {

    constructor() {
        super();
        this.dateTimeService = new DateTimeService();
    }

    renderSchedulesReminders(schedules) {
        const result = [];
        if (schedules.length) {
            schedules.map(sch => {
                const iconClassNameEmailStatuses = {
                    pending: 'btn-font-metal',
                    sent: 'btn-font-metal',
                    opened: 'btn-font-info',
                    fail: 'btn-font-danger',
                    failed: 'btn-font-danger',
                };
                let iconClassName = 'pointer flaticon2-check-mark ';
                iconClassName += iconClassNameEmailStatuses[sch.email_status];

                const html = `
                    <div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong>${locales_es.scheduleNotificationsDetailItems.email_scheduled_at}: </strong>
                            </div>
                            <div class="col-6 text-right">
                                ${sch.email_scheduled_at ? (
                                    this.dateTimeService.parseEventDate(sch.email_scheduled_at, false, 'full-string') 
                                    + ' ' + 
                                    this.dateTimeService.parseEventTime(sch.email_scheduled_at, 'full-string')
                                ) : locales_es.no}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong>${locales_es.scheduleNotificationsDetailItems.email_sent_at}:</strong> 
                            </div>
                            <div class="col-6 text-right">
                                ${sch.email_sent_at ? (
                                    this.dateTimeService.parseEventDate(sch.email_sent_at, false, 'full-string')
                                    + ' ' +
                                    this.dateTimeService.parseEventTime(sch.email_sent_at, 'full-string')
                                ) : locales_es.no}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-6">
                                <strong>${locales_es.scheduleNotificationsDetailItems.email_opened_at}:</strong> 
                            </div>
                            <div class="col-6 text-right">
                                ${sch.email_opened_at ? (
                                    this.dateTimeService.parseEventDate(sch.email_opened_at, false, 'full-string')
                                    + ' ' +
                                    this.dateTimeService.parseEventTime(sch.email_opened_at, 'full-string')
                                ) : locales_es.no}
                            </div>
                        </div>
                    </div>
                `;

                result.push(
                    <a type="button" data-toggle="popover" data-trigger="hover"
                       data-placement="top"
                       data-content={html}
                       data-html="true"
                       data-original-title={locales_es.scheduleNotificationsDetailTitle}>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                            {locales_es.scheduleNotifications[sch.notification_type] || sch.notification_type}
                            <span className="badge">
                                <i className={iconClassName}/>
                                {(sch.email_status === EMAIL_REMINDER_STATUS_SENT || sch.email_status === EMAIL_REMINDER_STATUS_OPENED) &&
                                    <i className={iconClassName}/>
                                }
                            </span>
                        </li>
                    </a>
                )
            })
        }
        return result;
    }

    render() {
        const {data} = this.props;
        return (
            <div className="mt-3 mb-5">
                <strong className="col-form-label d-inline-block mb-1">Notificaciones al paciente</strong>
                <ul className="list-group">
                    {this.renderSchedulesReminders(data)}
                </ul>
                {window.initPopovers()}
            </div>
        )
    }
}
