**English** | [Português](README.md)

# ProjScrum

**ProjScrum** is a web platform for Scrum management, built to make it easier for software development teams to adopt agile methodologies. The system uses modern technologies such as **React** for the user interface, **Node.js** for the backend, **MySQL** for database modeling, providing a robust and efficient structure for data storage, and **SQLite** for the remote database.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [How to Use](#how-to-use)
5. [Credits](#credits)
6. [License](#license)

## Project Overview

**ProjScrum** was developed as part of the Applied Software Engineering course at UNISAGRADO university. Its main goal is to build a Scrum management website that makes it easier to apply agile methodologies in software development environments.

ProjScrum was designed for teams that want to implement Scrum practices in an efficient, organized way. The platform supports creating, managing, and tracking projects, sprints, and daily stand-ups, promoting effective collaboration among team members.

## Features

- **Project Creation and Management**: Users can create new projects, define descriptions and delivery dates, and manage the members involved. Users can view every project they are part of, making it easier to follow activities. **Note**: access to this feature can be limited by the user's role (User, Manager, Admin), so that only users with the proper permissions can create or modify projects.

- **Sprint and Daily Creation and Management**: Users can create sprints, which are focused work periods, and dailies, which are daily progress meetings. Goals and delivery dates can be set and activity status can be monitored. **Note**: creating and editing sprints and dailies can be restricted to Managers and Admins, ensuring tighter control over how work is organized.

- **Review of Completed Sprints**: After a sprint ends, users can evaluate the team's and the activities' performance, giving feedback on aspects such as tasks, communication, and deliverables. These reviews support continuous improvement of the development process. **Limitation**: only users with the Manager or Admin role can submit this review, so that evaluations are made by people with a broader view of the project.

- **History of Projects with Their Sprints and Dailies**: The system keeps a detailed history of all projects, sprints, and dailies, letting users revisit past information and analyze progress over time. This helps identify patterns and areas for improvement. All users can access the history, but editing or deleting records can be restricted to higher roles.

- **Calendar for Tracking Goals and Meetings**: An integrated calendar lets users view and manage their goals and meetings, keeping everyone aligned on deadlines and commitments. The calendar can be synchronized with sprint and daily events.

## Technologies Used

- HTML/CSS
- React
- Node.js
- MySQL (database modeling)
- SQLite (remote database)

## How to Use

### 1. Prerequisites

Make sure the following is installed on your machine:

- Node.js: you can download the latest version at nodejs.org.

### 1. Clone the Repository

First, clone the ProjScrum repository. Open a terminal and run:

```bash
git clone https://github.com/pedromcd/ProjScrum.git
```

### 2. Install the Client Dependencies

To install the frontend (client) dependencies:

1. Open a terminal dedicated to the client.

2. Go to the project directory:

   ```bash
   cd ProjScrum
   ```

3. Run the following command to install the dependencies:

   ```bash
   npm install
   ```

### 3. Install the Server Dependencies

To install the backend (server) dependencies:

1. Open a terminal dedicated to the server.

2. Go to the project's server directory:

   ```bash
   cd ProjScrum/server
   ```

3. Run the following command to install the dependencies:

   ```bash
   npm install
   ```

### 4. Start the Client in Development Mode

To start the frontend in development mode, run the following commands in the client terminal:

```bash
cd ProjScrum/client
npm run dev
```

Once the client server starts, you can open the application in your browser at:

```bash
http://localhost:5173
```

### 5. Start the Backend in Development Mode

To start the backend in development mode, run the following commands in the server terminal:

```bash
cd ProjScrum/server
npm start
```

### Note

Make sure both the server and the client are running at the same time so the application works correctly. The client communicates with the server for operations such as authentication, project management, and other features.

## Credits

Pedro Marques Correa Domingues

Pedro Lucas Franco

Victor Hugo de Deus Machado

Pedro Antônio de Souza Rezende

Lucas Pomini Galli

Raphael Camurri Michelassi

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
