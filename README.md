# ProjScrum

**ProjScrum** é uma plataforma web de gerenciamento Scrum, desenvolvida com o objetivo de facilitar a implementação de metodologias ágeis em equipes de desenvolvimento de software. O sistema é construído utilizando tecnologias modernas, como **React** para a interface do usuário, **Node.js** para o backend, **MySQL** para a modelagem do banco de dados, garantindo uma estrutura robusta e eficiente para o armazenamento de dados e **SQLite** para o banco de dados remoto.

## Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Como Usar](#como-usar)
5. [Créditos](#créditos)
6. [Licença](#licença)

## Visão Geral do Projeto

**ProjScrum** é um projeto desenvolvido como parte da disciplina de Engenharia de Software Aplicada, oferecida pela Universidade Unisagrado. Este projeto tem como objetivo principal a criação de um site de gerenciamento Scrum, que facilita a aplicação de metodologias ágeis em ambientes de desenvolvimento de software.

O ProjScrum foi concebido para atender às necessidades de equipes que desejam implementar práticas de Scrum de forma eficiente e organizada. A plataforma permite a criação, gerenciamento e acompanhamento de projetos, sprints e dailys, promovendo uma colaboração eficaz entre os membros da equipe.

## Funcionalidades

- **Criação e Gerenciamento de Projetos**: Permite aos usuários criar novos projetos, definir descrições, datas de entrega e gerenciar os membros envolvidos. Os usuários podem visualizar todos os projetos em que estão envolvidos, facilitando o acompanhamento das atividades. **Nota**: O acesso a essa funcionalidade pode ser limitado com base no cargo do usuário (Usuário, Gerente, Admin), garantindo que apenas usuários com permissões adequadas possam criar ou modificar projetos.

- **Criação e Gerenciamento de Sprints e Dailys**: Os usuários podem criar sprints, que são períodos de trabalho focados, e dailys, que são reuniões diárias para acompanhamento do progresso. É possível definir metas, datas de entrega e monitorar o status das atividades. **Observação**: A criação e edição de sprints e dailys podem ser restritas a Gerentes e Administradores, assegurando um controle mais rigoroso sobre a organização do trabalho.

- **Avaliação de Sprints Finalizadas**: Após a conclusão de uma sprint, os usuários podem avaliar o desempenho da equipe e das atividades, fornecendo feedback sobre aspectos como atividades, comunicação e entregas. Essas avaliações ajudam a melhorar o processo de desenvolvimento contínuo. **Limitação**: Apenas usuários com cargos de Gerente e Admin podem realizar essa avaliação, garantindo que as análises sejam feitas por pessoas com uma visão mais ampla do projeto.

- **Históricos com Projetos e suas Respectivas Sprints e Dailys**: O sistema mantém um histórico detalhado de todos os projetos, sprints e dailys, permitindo que os usuários revisitem informações passadas e analisem o progresso ao longo do tempo. Isso é útil para identificar padrões e áreas de melhoria. Todos os usuários têm acesso a esses históricos, mas a capacidade de editar ou excluir registros pode ser restrita a cargos superiores.

- **Calendário para Acompanhamento de Metas e Reuniões**: Um calendário integrado permite que os usuários visualizem e gerenciem suas metas e reuniões, garantindo que todos estejam alinhados em relação aos prazos e compromissos. O calendário pode ser sincronizado com eventos de sprints e dailys.

## Tecnologias Utilizadas

- HTML/CSS
- React
- Node.js
- MySQL (Modelagem do banco de dados)
- SQLite (Banco de dados remoto)

## Como Usar

### 1. Pré-requisitos

Certifique-se de que você possui os seguintes pré-requisitos instalados em sua máquina:

- Node.js: Você pode baixar a versão mais recente do Node.js em nodejs.org.

### 1. Clone o Repositório

Primeiro, você precisa clonar o repositório do ProjScrum. Abra um terminal e execute o seguinte comando:

```bash
git clone https://github.com/seu-usuario/ProjScrum.git
```

Substitua seu-usuario pelo seu nome de usuário do GitHub.

### 2. Instale as Dependências do Cliente

Para instalar as dependências do frontend (cliente), siga os passos abaixo:

1. Abra um terminal dedicado para o cliente.

2. Navegue até o diretório do projeto:

   ```bash
   cd ProjScrum
   ```

3. Execute o seguinte comando para instalar as dependências:

   ```bash
   npm install
   ```

### 3. Instale as Dependências do Servidor

Para instalar as dependências do backend (servidor), siga os passos abaixo:

1. Abra um terminal dedicado para o servidor.

2. Navegue até o diretório do servidor do projeto:

   ```bash
   cd ProjScrum/server
   ```

3. Execute o seguinte comando para instalar as dependências:

   ```bash
   npm install
   ```

### 4. Inicie o Servidor do Cliente no Modo de Desenvolvimento

Para iniciar a aplicação frontend no modo de desenvolvimento, execute os seguintes comandos no terminal dedicado ao cliente:

```bash
cd ProjScrum/client
npm run dev
```

Após executar este comando, o servidor do cliente será iniciado e você poderá acessar a aplicação no navegador em:

```bash
http://localhost:5173
```

### 5. Inicie o Servidor do Backend no Modo de Desenvolvimento

Para iniciar a aplicação backend no modo de desenvolvimento, execute os seguintes comandos no terminal dedicado ao servidor:

```bash
cd ProjScrum/server
npm start
```

### Observação

Certifique-se de que tanto o servidor quanto o cliente estejam rodando simultaneamente para garantir que a aplicação funcione corretamente. O cliente se comunicará com o servidor para realizar operações como autenticação, gerenciamento de projetos e outras funcionalidades.

## Créditos

Pedro Marques Correa Domingues

Pedro Lucas Franco

Victor Hugo de Deus Machado

Pedro Antônio de Souza Rezende

Lucas Pomini Galli

Raphael Camurri Michelassi

## Licença

Este projeto é licenciado sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.
