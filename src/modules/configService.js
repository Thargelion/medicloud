import APIService from "./apiService";
import {clinicDataExpireDateLocalStorage, clinicDataLocalStorage} from "../models/constants";

class ConfigService {

    constructor(){
        this.api = new APIService();
    }

    async getLocalClinicData() {
        return new Promise((resolve, reject) => {
            try {

                const ls = JSON.parse(localStorage.getItem(clinicDataLocalStorage));

                // TODO agregar un expire de 24hs. a esto...
                const now = new Date();
                // const ttl = 86400000;// seconds (24 hours)
                // const ttl = 8640000;// más o menos 3 hrs.
                const ttl = 3600000; // ms = 1 hr
                const lsTTL = JSON.parse(localStorage.getItem(clinicDataExpireDateLocalStorage));

                if (ls) {
                    // console.log(now.toLocaleString());
                    // console.log(new Date(lsTTL).toLocaleString());
                    if(lsTTL && (now.getTime() < lsTTL)) {
                        // console.log('not refreshing');
                        resolve(ls);
                    } else {
                        // console.log('refreshing...');
                        this.setClinicDataExpireDate(now, ttl);
                        this.getRemoteClinicData()
                            .then(res => resolve(res))
                            .catch(err => reject(err));
                    }
                } else {
                    this.setClinicDataExpireDate(now, ttl);
                    this.getRemoteClinicData()
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                }
            } catch(err) {
                console.info(err);
                this.clearLocalClinicData();
            }
        });
    }

    setClinicDataExpireDate(date, ttl) {
        console.log('setted');
        localStorage.setItem(clinicDataExpireDateLocalStorage, (date.getTime() + ttl));
    }

    async getRemoteClinicData() {
        return new Promise((resolve, reject) => {
            this.api.getClinic(window.location.origin).then(res => {
                const clinicData = res.data;
                localStorage.setItem(clinicDataLocalStorage, JSON.stringify(clinicData || {}));
                resolve(clinicData);
            }).catch(err => {
                // this.props.showMainModal(locales_es.errorModal.title, this.helpers.getErrorMsg(err));
                reject(err);
            });
        });
    }

    clearLocalClinicData() {
        localStorage.removeItem(clinicDataLocalStorage);
    }

    getAppIdByAppName(AppName) {
        return new Promise((resolve, reject) => {
            this.api.getAppIdByAppName(AppName)
                .then((res)=>{
                    resolve(res);
                }).catch((err)=>{
                    console.error('Get Initial Config - Fatal Error');
                    reject(new Error(err));
            });
        });
    }

    getInitialConfig() {
        return new Promise((resolve, reject) => {
            this.api.getInitialConfig()
                .then((res)=>{
                    resolve(res);
                }).catch((err)=>{
                console.error('Get Initial Config - Fatal Error');
                reject(new Error(err));
            });
        });
    }

    // Primera iteración
    // Hay que analizar si esto persiste cuando la API devuelve componentes
    // Hay que analizar la factibilidad de implementar CSS Modules
    // Hay que analizar la factibilidad de implementar --vars
    setInitialConfig() {
        if (window.appConfig) {
            this.setGlobalConfig();
            this.setFavicon();
            this.setHTMLTitle();
            this.setComponentsConfig();
            this.setSectionsConfig();
            this.setGlobalScripts();
        }
    }

    setGlobalScripts() {
        if(window.appConfig.scripts) {
            const scripts = window.appConfig.scripts;

            if (scripts.ga) {
                // <script async src='https://www.googletagmanager.com/gtag/js?id=UA-107244973-1'>
                // </script>
                // <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'UA-107244973-1');</script>
               const script = document.createElement('script');
               script.async = '';
               script.src = 'https://www.googletagmanager.com/gtag/js?id=' + scripts.ga.id;

               script.onload = () => {
                   console.log('google analytics loaded');
                   this.googleAnalyticsExecution(scripts.ga.id);
               };

               document.body.appendChild(script);
            }
        }
    }

    gtag(){
        window.dataLayer.push(arguments);
    }
    googleAnalyticsExecution(gaId) {
        window.dataLayer = window.dataLayer || [];
        this.gtag('js', new Date());
        this.gtag('config', gaId);
    }

    setGlobalConfig() {
        if(window.appConfig.globals) {
            const styleTag = document.createElement('style');
            styleTag.innerHTML = '.world-shop-card__info-title-blue, .world-shop-card__info-timer-blue-number,' +
                'a.world-shop-link,' +
                '.world-shop-checkout__product-total-amount-container,' +
                '.world-shop-vip__description-title {' +
                'color: ' + window.appConfig.globals.primaryColor + ';' +
                '}';
            styleTag.innerHTML += '.world-shop-vip__info-icons {' +
                'fill: ' + window.appConfig.globals.primaryColor + ';' +
                '}';
            styleTag.innerHTML += '.modalQuantitySelector .fakeRadio.checked {' +
                'background-color: ' + window.appConfig.globals.primaryColor + ';' +
                '}';
            styleTag.innerHTML += '.world-header, .world-menu__list {' +
                'background-color: ' + window.appConfig.globals.secondaryColor + ';' +
                '}';
            styleTag.innerHTML += '.world-shop-list-block__footer-text {' +
                'color: ' + window.appConfig.globals.tertiaryColor + ';' +
                '}';
            document.body.appendChild(styleTag);
        }
    }

    setFavicon() {
        if(window.appConfig.globals) {
            // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />
            const linkTag = document.createElement('link');
            linkTag.rel = "shortcut icon";
            linkTag.href = window.appConfig.favicon;
            document.head.appendChild(linkTag);
        }
    }

    setHTMLTitle() {
        if(window.appConfig.globals) {
            // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />
            const titleTag = document.getElementById('htmlTitle');
            if(titleTag) {
                titleTag.innerHTML = window.appConfig.title;
            }
        }
    }

    setComponentsConfig() {
        if(window.appConfig.components) {
            // BUTTONS
            if(window.appConfig.components.button) {
                const styleTag = document.createElement('style');
                styleTag.innerHTML = '.world-shop-vip__buy-button .world-shop-btn, .world-shop-login .world-shop-login__actions-wrapper .world-shop-btn, .world-shop-register .world-shop-login__actions-wrapper .world-shop-btn, .world-shop-recovery .world-shop-login__actions-wrapper .world-shop-btn,' +
                    '.world-btn, .rodal-footer .btn.btn-primary, .world-shop-btn, .world-btn__full, .world-btn__gray-full, .world-btn__gray, .world-btn__facebook, .world-btn__facebook-full, .world-btn__small, .world-btn__small-dark, .world-btn__small_grey {' +
                    'background: ' + window.appConfig.components.button.background + ';' +
                    '}';
                document.body.appendChild(styleTag);
            }
        }
    }

    setSectionsConfig() {
        if(window.appConfig.sections) {

            const sections = window.appConfig.sections;
            const sectionsKeys = Object.keys(sections);

            sectionsKeys.forEach(section => {
                const sectionKeys = Object.keys(sections[section]);
                sectionKeys.forEach(page => {
                    const styleTag = document.createElement('style');
                    styleTag.innerHTML = `.world-shop-${page} {` +
                            'background-image: url("' + sections[section][page].backgroundImage + '");' +
                        '}';
                    document.body.appendChild(styleTag);
                })
            });
        }
    }
}

export default ConfigService;
