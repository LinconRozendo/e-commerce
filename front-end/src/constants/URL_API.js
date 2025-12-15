// Arquivo de configuração da URL da API

let URL_API;

const environment = 'local';

if (environment === 'local') {
    URL_API = 'http://localhost:3000/'
}


export { URL_API }