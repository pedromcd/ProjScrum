-- -----------------------------------------------------
-- Table `usuarios`
-- -----------------------------------------------------
CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  imagem TEXT,
  cargo ENUM('Usuário', 'Gerente', 'Admin') NOT NULL DEFAULT 'Usuário',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `projetos`
-- -----------------------------------------------------
CREATE TABLE projetos (
  id INT NOT NULL AUTO_INCREMENT,
  projectName VARCHAR(100) NOT NULL,
  projectDesc VARCHAR(500),
  deliveryDate DATE NOT NULL,
  criado_por INT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Junction table to link users to projects
-- -----------------------------------------------------
CREATE TABLE projeto_usuarios (
  projectId INT NOT NULL,
  userId INT NOT NULL,
  data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (projectId, userId),
  FOREIGN KEY (projectId) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `sprints`
-- -----------------------------------------------------
CREATE TABLE sprints (
  id INT NOT NULL AUTO_INCREMENT,
  projectId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  deliveryDate DATE NOT NULL,
  criado_por INT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (projectId) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `dailys`
-- -----------------------------------------------------
CREATE TABLE dailys (
  id INT NOT NULL AUTO_INCREMENT,
  projectId INT NOT NULL,
  sprintId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  deliveryDate DATE NOT NULL,
  tag ENUM('Pendente', 'Em progresso', 'Concluido') NOT NULL DEFAULT 'Pendente',
  criado_por INT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (sprintId) REFERENCES sprints(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `sprintsfinalizadas`
-- -----------------------------------------------------
CREATE TABLE sprintsfinalizadas (
  id INT NOT NULL AUTO_INCREMENT,
  projectId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  atividades INT NOT NULL,
  equipe INT NOT NULL,
  comunicacao INT NOT NULL,
  entregas INT NOT NULL,
  finalizado_por INT NOT NULL,
  data_finalizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (projectId) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (finalizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `dailys_finalizadas`
-- -----------------------------------------------------
CREATE TABLE dailys_finalizadas (
  id INT NOT NULL AUTO_INCREMENT,
  projectId INT NOT NULL,
  sprintId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  deliveryDate DATE NOT NULL,
  tag ENUM('Pendente', 'Em progresso', 'Concluido') NOT NULL DEFAULT 'Concluido',
  finalizado_por INT NOT NULL,
  data_finalizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (projectId) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (sprintId) REFERENCES sprintsfinalizadas(id) ON DELETE CASCADE,
  FOREIGN KEY (finalizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Table `events`
-- -----------------------------------------------------
CREATE TABLE events (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NULL,
  description TEXT,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;