import React, {Component} from 'react';
import Spinner from "../../components/spinner";

class ClearCachePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            result: null
        }
    }

    componentDidMount() {
        if (window.localStorage) {
            window.localStorage.clear();
            this.setResult(true);
        } else {
            this.setResult(false);
        }
    }

    setResult(bool) {
        this.setState({
            result: bool
        })
    }

    render() {
        const {result} = this.state;
        return (
            result === null ? <Spinner/> :
                result ? <h1>Cache limpiado correctamente</h1>
                    : <h1>Hubo un problema al limpiar el cache :( </h1>
        )
    }
}

export default ClearCachePage;
