# 🛍️ E-Commerce Shop

Plataforma completa de E-cCommerce com sistema que permite a navegação por vitrine, busca, gestão de carrinho, checkout, favoritos e conta com um painel administrativo para vendedores com upload de produtos em massa (CSV) e dashboard de métricas.

## 🚀 Tecnologias Utilizadas

### Front-end
- **Next.js 14** (App Router)
- **TailwindCSS** (Estilização)
- **Axios** (Consumo de API)

### Back-end
- **Node.js & Express**
- **Sequelize ORM**
- **PostgreSQL** (Banco de Dados)
- **Multer & CSV-Parser** (Upload e processamento de arquivos)
- **JWT** (Autenticação)

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado.
- PostgreSQL rodando (local ou Docker).

### 1. Configurando o Banco de Dados (PostgreSQL)
Crie duas databases  com o nome que preferir e configure o .env com ela e suas credenciais.

### 2. Rodando o Back-end (Servidor)

1. Entre na pasta do servidor:
```bash
   cd back-end
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo .env na pasta backend com o seguinte conteúdo (ajuste conforme seu banco):

```bash
DB_HOST=localhost
DB_USER=postgres
DB_PASS=sua_senha
DB_NAME=database
DB_PORT=5432
JWT_SECRET=chave
PORT=3000
```
4. Inicie o servidor:

```bash
npm start
# O servidor rodará em http://localhost:3000 (ou a porta definida)
```
Nota: O Sequelize irá criar as tabelas automaticamente ao iniciar.


### 3. Rodando o Front-end (Aplicação Web)

1. Abra um novo terminal e entre na pasta do front-end:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o projeto:

```bash
npm run dev
# O site rodará em http://localhost:3001

```

