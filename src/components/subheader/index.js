import React, {Component} from 'react';

export default class Subheader extends Component {
    render() {

        const {breadcrumbs} = this.props;

        return (
            <div id="kt_subheader" className="kt-subheader kt-grid__item ">
                <div className="kt-container  kt-container--fluid ">

                    <div className="kt-subheader__title">
                        {breadcrumbs &&
                        <div className="kt-subheader__breadcrumbs">
                            {breadcrumbs.length &&
                            breadcrumbs.map((b, index) => {
                                return (
                                    index === 0 ?
                                        <a key={'subheader-' + index} href={b.href}
                                           className="kt-subheader__breadcrumbs-link kt-subheader__breadcrumbs-link--home">{b.name}</a>
                                        :
                                        <span key={'subheader-' + index}>
                                            <span className="kt-subheader__breadcrumbs-separator d-inline-block kt-valign-middle"/>
                                            <a href={b.href} className="kt-subheader__breadcrumbs-link ">{b.name}</a>
                                        </span>
                                )
                            })
                            }
                        </div>
                        }
                    </div>

                </div>
            </div>
        )
    }
}
