import React, {Component} from 'react';
import "./index.css";
import spinner from "./../../images/loading.gif";


export default class Spinner extends Component {

    render() {
        const defaultClass = 'spinner-container';
        const className = this.props.className ? (defaultClass + ' ' + this.props.className) : defaultClass;

        return (
            <div className={className}>
                <img src={spinner}/>
            </div>
        )
    }
}
