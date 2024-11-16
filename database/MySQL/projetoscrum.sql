-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema projetoscrum
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `projetoscrum` DEFAULT CHARACTER SET utf8mb3 ;
USE `projetoscrum` ;

-- -----------------------------------------------------
-- Table `projetoscrum`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `imagem` TEXT NULL DEFAULT NULL,
  `cargo` ENUM('Usuário', 'Gerente', 'Admin') NOT NULL DEFAULT 'Usuário',
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `projetoscrum`.`projetos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`projetos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `projectName` VARCHAR(100) NOT NULL,
  `projectDesc` VARCHAR(500) NULL DEFAULT NULL,
  `deliveryDate` DATE NOT NULL,
  `criado_por` INT NOT NULL, -- User who created the project
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`criado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Junction table to link users to projects
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`projeto_usuarios` (
  `projectId` INT NOT NULL,
  `userId` INT NOT NULL,
  `data_adicao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`projectId`, `userId`),
  FOREIGN KEY (`projectId`) REFERENCES `projetos`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `projetoscrum`.`sprints`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`sprints` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `projectId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `deliveryDate` DATE NOT NULL,
  `criado_por` INT NOT NULL, -- User who created the sprint
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `projectId` (`projectId` ASC) VISIBLE,
  CONSTRAINT `sprints_ibfk_1`
    FOREIGN KEY (`projectId`)
    REFERENCES `projetoscrum`.`projetos` (`id`)
    ON DELETE CASCADE,
  FOREIGN KEY (`criado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `projetoscrum`.`dailys`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`dailys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `projectId` INT NOT NULL,
  `sprintId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NULL DEFAULT NULL,
  `deliveryDate` DATE NOT NULL,
  `tag` ENUM('Pendente', 'Em progresso', 'Concluido') NOT NULL DEFAULT 'Pendente',
  `criado_por` INT NOT NULL, -- User who created the daily
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `sprintId` (`sprintId` ASC) VISIBLE,
  INDEX `projectId` (`projectId` ASC) VISIBLE,
  CONSTRAINT `dailys_ibfk_1`
    FOREIGN KEY (`sprintId`)
    REFERENCES `projetoscrum`.`sprints` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `dailys_ibfk_2`
    FOREIGN KEY (`projectId`)
    REFERENCES `projetoscrum`.`projetos` (`id`)
    ON DELETE CASCADE,
  FOREIGN KEY (`criado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `projetoscrum`.`sprintsfinalizadas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`sprintsfinalizadas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `projectId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `atividades` INT NOT NULL,
  `equipe` INT NOT NULL,
  `comunicacao` INT NOT NULL,
  `entregas` INT NOT NULL,
  `finalizado_por` INT NOT NULL, -- User who finalized the sprint
  `data_finalizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `projectId` (`projectId` ASC) VISIBLE,
  CONSTRAINT `sprintsfinalizadas_ibfk_1`
    FOREIGN KEY (`projectId`)
    REFERENCES `projetoscrum`.`projetos` (`id`)
    ON DELETE CASCADE,
  FOREIGN KEY (`finalizado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;