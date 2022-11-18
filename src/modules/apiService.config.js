import fetchIntercept from 'fetch-intercept';
import {userDataLocalStorage, userAccessToken} from './../models/constants';

const unregister = fetchIntercept.register({
  request: function (url, config) {
    //console.log('interceptor');
    // Modify the url or config here
    const withDefaults = Object.assign({}, config);
    const userData = JSON.parse(localStorage.getItem(userDataLocalStorage));

    if (userData) {
      if (userData[userAccessToken]) {
        // console.log(withDefaults);
        // withDefaults.headers = defaults.headers || new Headers({ // Este default daba undefined.
        // Debio estar definido en alguna config que nosotros no estamos usando por ahora
        // https://stackoverflow.com/questions/48195324/react-fetch-intercept-modify-all-headers?rq=1
        withDefaults.headers = new Headers({
          'AuthorizationJWT': `Bearer ${userData[userAccessToken]}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        });
        // withDefaults.headers = Object.assign(withDefaults.headers, {'authorization': `Bearer ${userData[userAccessToken]}`});
        // withDefaults.headers = withDefaults.headers.append('authorization', `Bearer ${userData[userAccessToken]}`);
      }
      /*if(window.appId && userData[userAccessToken]){
          url += '&access_token=' + userData[userAccessToken];
      }*/
    }
    return [url, withDefaults];
  },

  requestError: function (error) {
    // Called when an error occured during another 'request' interceptor call
    return Promise.reject(error);
  },

  response: function (response) {
    // Modify the reponse object
    return response;
  },

  responseError: function (error) {
    // Handle an fetch error
    return Promise.reject(error);
  }
});

export default unregister;
