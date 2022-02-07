import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
})

api.interceptors.response.use( 
  responseSuccess => responseSuccess, 
  (responseError: AxiosError) => {
    if(responseError.response.status === 401) {
      if (responseError.response.data?.code === 'token.expired') {
        cookies = parseCookies();
        const { 'nextauth.refreshToken': refreshToken } = cookies 

        const originalConfig = responseError.config;

        if(!isRefreshing) {
          isRefreshing = true;

          api.post('/refresh', { refreshToken })
          .then(response => {
            const { token, refreshToken: newRefreshToken } = response.data;
  
            setCookie(undefined, "nextauth.token", token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: "/",
            });
  
            setCookie(undefined, "nextauth.refreshToken", newRefreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: "/",
            });
  
            api.defaults.headers['Authorization'] = `Beaser ${token}`


            failedRequestsQueue.forEach(request => request.resolve(token))
            failedRequestsQueue = [];
          })
          .catch(() => {
            failedRequestsQueue.forEach(request => request.reject())
            failedRequestsQueue = [];
          })
          .finally(() => {
            isRefreshing = false;
          })
        }

        // axios não permite async então uma das formas é declarar a promise e usar o resolve e/ou reject para aguardar o que quer ser executado
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalConfig.headers['Authorization'] = `Beaser ${token}`
              resolve(api(originalConfig))
            },
            reject: (error: AxiosError) => {
              reject(error )
            },
          })
        })
      } else {
         
      }
    }
  }
)