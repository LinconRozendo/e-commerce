import axios from 'axios';
import Cookies from 'js-cookie';
import { URL_API } from '../constants/URL_API'; 

const api = axios.create({
    baseURL: URL_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Antes de cada requisição, verifica se tem token no Cookie e injeta no Header
api.interceptors.request.use((config) => {
    const token = Cookies.get('token'); // Vamos usar a lib 'js-cookie'
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//  Se der 401 (Token inválido), desloga o usuário
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                Cookies.remove('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;