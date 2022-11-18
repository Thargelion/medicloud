import { userDataLocalStorage, userAccessToken } from './../models/constants'
import {
    EVENT_PROFILE_UPDATE,
    headerNavId,
    setNavLinksEvent
} from "../models/constants";
import './../modules/apiService';
import APIService from "./apiService";

class AuthService {

    constructor(){
        this.api = new APIService();
    }

    // Helper to get GET parameters from the URL
    getUrlVars () {
        if (!window) {
            return
        }
        var vars = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    checkExternalAccessToken(){
        const accessToken = this.getUrlVars()[userAccessToken];
        if(accessToken){
            this.saveAccessToken(accessToken); // for API Service Interceptor
            // Get user data
            this.getRemoteUserData().then((res) => {
                res.access_token = accessToken;
                this.saveUserData(res);
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    async login(email, password, clinicId) {
        const loginResponse = await this.api.login(email, password, clinicId)
            .then(res => {
                this.saveUserData(res.data);
                this.setHeaderInOrderOfUserStatus(); // Para habilitar menúes. Deshabilitado por ahora
            }).catch(err => {
                throw new Error(err);
            });

        return loginResponse;
    }

    async register(data) {
        const registerResponse = await this.api.register(data)
            .then(res => {
                this.saveUserData(res.data);
                this.setHeaderInOrderOfUserStatus(); // Para habilitar menúes. Deshabilitado por ahora
            }).catch(err => {
                throw new Error(err);
            });

        return registerResponse;
    }

    async updateUser(userData) {
        const updateResponse = await this.api.updateUser(userData)
            .then(res => {
                // this.saveUserData(res.data);
                // this.setHeaderInOrderOfUserStatus(); // Para habilitar menúes. Deshabilitado por ahora

                const nav = document.getElementById(headerNavId);

                /*if(!nav) { throw new Error('Could not find the header navigation'); }*/
                if(!nav) { return res; }

                const profileUpdate = new CustomEvent(EVENT_PROFILE_UPDATE, {userData: res.data.user});
                nav.dispatchEvent(profileUpdate);

                return res;
            }).catch(err => {
                throw new Error(err);
            });

        return updateResponse;
    }

    async recovery(email) {
        const recoveryResponse = await this.api.passwordRequest(email)
            .catch(err => {
                throw new Error(err);
            });

        return recoveryResponse;
    }

    changePassword(obj){
        return new Promise((resolve, reject) => {
            if(!obj || !obj.oldPassword || !obj.newPassword || !obj.newPasswordRepeated){
                reject(new Error('obj no definido'));
            }

            if(obj.newPassword !== obj.newPasswordRepeated){
                reject(new Error('Las contraseñas no coinciden'));
            }
            const userData = this.getUserData();

            this.login(userData.email, obj.oldPassword).then(()=> {
                let data = {
                    id: userData.id,
                    password : obj.newPassword,
                    name: userData.name
                };
                this.updateUser(data).then((res)=>{
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

	async updatePassword(oldPassword, newPassword, newPasswordConfirmation) {
		return await this.api.updatePassword(oldPassword, newPassword, newPasswordConfirmation)
      .then(res => {
          return res.data;
      }).catch(err => {
          console.log(err);
          throw err;
      });
	}

    logout(redirect) {
        localStorage.clear();
        this.setHeaderInOrderOfUserStatus();

        if(redirect) {
            // TODO: Después revisar esta forma de recarga la pagina, es dudosa
            // TODO: Estaría bueno definir desde API Config la home por defecto del site
            // y llamarla acá para el redirect
            window.location.href = '/login'
        }
    }

    saveAccessToken(accessToken){
        // Save for others views. This is a possible entry view:
        //$localStorage.access_token = this.getUrlVars()[userAccessToken];
        localStorage.setItem(userDataLocalStorage, JSON.stringify({
            [userAccessToken] : accessToken
        }));
    }

    saveUserData(userData) {
        localStorage.setItem(userDataLocalStorage, JSON.stringify(userData));
    }

    getRemoteUserData() {
        return new Promise((resolve, reject) => {
            this.api.getUserMe()
                .then((res)=>{
                    resolve(res);
                }).catch((err)=>{
                    reject(err);
            });
        });
    }

    getLocalUserType() {
        const ls = JSON.parse(localStorage.getItem(userDataLocalStorage));
        return ls && ls.user && ls.user.user_type ? ls.user.user_type : undefined;
    }

    getUserData() {
        return JSON.parse(localStorage.getItem(userDataLocalStorage));
    }

    getAccessToken() {
        const userData = JSON.parse(localStorage.getItem(userDataLocalStorage));
        return userData && userData[userAccessToken] ? userData[userAccessToken] : null;
    }

    isLoggedUser() {
        return !!localStorage.getItem(userDataLocalStorage);
    }

    checkLoginStatusAndDoSomethingOrDefault(doSomething, _default) {
        const userData = JSON.parse(localStorage.getItem(userDataLocalStorage));
        userData && userData.token ? doSomething() : _default();
    }

    setHeaderInOrderOfUserStatus() {
        const nav = document.getElementById(headerNavId);
        /*if(!nav) { throw new Error('Could not find the header navigation'); }*/
        if(!nav) { return; }

        const setNavLinksEvt = new Event(setNavLinksEvent);
        nav.dispatchEvent(setNavLinksEvt);
    }

    // TODO: @Smell: sacar el if y enviar métodos que encapsulen y resuelvan acá, sin intervención de quién llama a este método
    checkIfGuestUser() {
        const userData = this.getUserData();
        console.log(userData);
        return new Promise((resolve, reject) => {
            if (!userData) {
                resolve('not_logged');
                return;
            }
            if (userData && !userData[userAccessToken]) {
                resolve('not_logged');
            } else {
                this.getRemoteUserData()
                    .then((res)=>{
                        const regex = /@guest\.technology/gm;
                        if(res && res.email && regex.test(res.email)){
                            resolve('is_guest_user');
                        } else {
                            resolve('is_logged_but_is_not_guest_user');
                        }
                    }).catch((err)=>{
                        reject(new Error(err));
                });
            }
        });
    }
}

export default AuthService;
