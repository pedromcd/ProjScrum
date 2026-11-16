[English](README.en.md) | **Português**

# 📋 ProjScrum

**Plataforma web para gerenciar projetos com Scrum: projetos, sprints, dailies em quadro kanban, avaliação de sprints e calendário da equipe.**

Projeto em equipe da disciplina de **Engenharia de Software Aplicada** (Ciência da Computação — UNISAGRADO). Frontend em React e backend em Node.js/Express, com autenticação JWT e banco de dados libSQL (Turso).

---

## 🎯 Objetivo

Equipes que estão começando com Scrum costumam controlar sprints e dailies em planilhas ou quadros soltos, sem histórico e sem papéis definidos. O ProjScrum reúne esse ciclo em um só lugar:

1. criar um projeto e definir a equipe;
2. planejar sprints;
3. acompanhar as dailies em um quadro **Pendente → Em progresso → Concluído**;
4. encerrar a sprint com uma **avaliação** da equipe;
5. consultar o **histórico** e o **calendário** de metas e reuniões.

O objetivo acadêmico foi aplicar o processo de engenharia de software de ponta a ponta: requisitos, modelagem do banco, arquitetura cliente-servidor, autenticação e controle de acesso por papéis.

---

## ✨ Funcionalidades

- **Contas e autenticação:** cadastro, login e logout. A senha é armazenada com **bcrypt**, e a sessão usa **JWT em cookie `httpOnly`**, válido por 24 horas.
- **Papéis de usuário:** `Usuário`, `Gerente` e `Admin`, com a interface adaptada ao papel de quem está logado.
- **Projetos:** criação com descrição, data de entrega e membros; listagem dos projetos de cada usuário; exclusão.
- **Sprints:** criação dentro de um projeto e listagem das sprints ativas e encerradas.
- **Dailies em kanban:** cada daily tem um status (`Pendente`, `Em progresso`, `Concluido`) e pode ser **arrastada entre as colunas**, com o status salvo no backend.
- **Encerramento de sprint com avaliação:** notas da equipe registradas em uma **transação no banco**, para que a sprint não fique finalizada pela metade.
- **Histórico** de projetos, sprints e dailies.
- **Calendário** (FullCalendar) com criação, edição e exclusão de eventos e mudança de data por arrastar e soltar.
- **Configurações da conta:** atualização de dados e foto de perfil e exclusão da conta.

---

## 🏗️ Arquitetura

```text
┌──────────────────────────┐        HTTP + cookie JWT        ┌───────────────────────────┐
│  Frontend (React + Vite) │  ─────────────────────────────► │  Backend (Node + Express) │
│  React Router, MUI,      │                                 │  rotas /api, middleware   │
│  FullCalendar, Axios     │ ◄─────────────────────────────  │  de autenticação, bcrypt  │
└──────────────────────────┘             JSON                └─────────────┬─────────────┘
                                                                           │ @libsql/client
                                                                           ▼
                                                              ┌───────────────────────────┐
                                                              │  Turso (libSQL / SQLite)  │
                                                              └───────────────────────────┘
```

- **Modelagem:** o banco foi modelado no **MySQL Workbench** (`database/MySQL/`) e implementado em **libSQL**, a versão do SQLite usada pelo Turso, hospedada na nuvem (`database/SQLite/` tem uma cópia local).
- **Autenticação:** `authMiddleware` valida o JWT do cookie em todas as rotas protegidas e expõe o `id` e o `cargo` do usuário para as rotas.
- **CORS** liberado só para as origens locais do frontend, com `credentials: true` para o envio do cookie.

---

## 🛠️ Tecnologias

**Frontend:** React 18, Vite, React Router, Material UI, Bootstrap, FullCalendar, Axios, Font Awesome

**Backend:** Node.js, Express, JSON Web Token, bcrypt, cookie-parser, express-fileupload, dotenv

**Banco de dados:** Turso (libSQL/SQLite), modelado no MySQL Workbench

---

## ▶️ Como executar

### Pré-requisitos

- Node.js 18 ou superior
- Um banco no [Turso](https://turso.tech/) (URL e token de acesso)

### 1. Clonar

```bash
git clone https://github.com/pedromcd/ProjScrum.git
cd ProjScrum
```

### 2. Configurar o backend

```bash
cd server
cp credentials.example.env credentials.env
npm install
```

Preencha o `credentials.env`:

```env
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu_token
JWT_SECRET=uma_chave_longa_e_aleatoria
PORT=3000
```

Crie as tabelas no Turso a partir do modelo em `database/`.

### 3. Rodar o backend

```bash
npm start          # dentro de server/ — API em http://localhost:3000/api
```

### 4. Rodar o frontend

Em outro terminal, na **raiz** do repositório:

```bash
npm install
npm run dev        # http://localhost:5173
```

---

## 🧩 Estrutura

```text
ProjScrum/
├── client/src/
│   ├── pages/            # Login, Cadastro, Home, DetalhesProjeto, Histórico, Calendário, Configurações
│   ├── components/       # Kanban de dailies, calendário, modais, formulários, navegação
│   └── services/api.js   # Cliente HTTP (Axios)
├── server/
│   ├── app.js            # Express, CORS, cookies, rotas
│   ├── config/           # Conexão com o Turso
│   ├── controllers/      # Usuários, papéis, projetos, eventos
│   ├── middlewares/      # Verificação do JWT
│   ├── routes/           # Rotas da API (projetos, sprints, dailies, eventos)
│   └── utils/            # Geração de token
├── database/
│   ├── MySQL/            # Modelo (.mwb) e script SQL
│   └── SQLite/           # Cópia local do banco
├── index.html, vite.config.js, package.json   # Configuração do frontend
└── LICENSE
```

---

## 💡 Aprendizados

- Separar frontend e backend e fazer os dois conversarem com segurança: cookie `httpOnly`, CORS com credenciais e JWT com expiração.
- Modelar um domínio com várias relações (usuários ↔ projetos ↔ sprints ↔ dailies ↔ avaliações) e usar **transações** quando uma operação altera várias tabelas.
- Trabalhar em equipe com Git, dividindo telas e rotas entre os integrantes.

## 🚧 Próximos passos

- Verificar o papel do usuário também no backend em todas as rotas sensíveis, não só na interface.
- Adicionar migrations versionadas para criar o banco automaticamente.
- Escrever testes para a API.
- Publicar uma demo online.

---

## 👥 Autores

Projeto em equipe:

- Pedro Marques Correa Domingues
- Pedro Lucas Franco
- Victor Hugo de Deus Machado
- Pedro Antônio de Souza Rezende
- Lucas Pomini Galli
- Raphael Camurri Michelassi

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE).
