import React from 'react';
import ReactDOM from 'react-dom';
import 'intl-tel-input/build/css/intlTelInput.css';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
// TODO: Revisar...
import 'rodal/lib/rodal.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


Sentry.init({
    dsn: "https://68356d0ac2354ae99a82322191ee220b@o243759.ingest.sentry.io/5807033",
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
