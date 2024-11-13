SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema projetoscrum
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `projetoscrum` DEFAULT CHARACTER SET utf8 ;
USE `projetoscrum` ;

-- -----------------------------------------------------
-- Table `projetoscrum`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `senha` VARCHAR(255) NOT NULL, -- Increased size for hashed passwords
  `imagem` TEXT NULL DEFAULT NULL,
  `cargo` VARCHAR(50) NULL DEFAULT 'Usuário',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `projetoscrum`.`projetos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`projetos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL, -- To link projects to a specific user
  `projectName` VARCHAR(100) NOT NULL,
  `projectDesc` VARCHAR(500) NULL DEFAULT NULL,
  `deliveryDate` DATE NOT NULL,
  `projectMembers` TEXT NULL DEFAULT NULL, -- Storing members as a comma-separated string
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) 
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `projetoscrum`.`project_members` (New Table)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`project_members` (
  `project_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`project_id`, `user_id`),
  CONSTRAINT `fk_project`
    FOREIGN KEY (`project_id`)
    REFERENCES `projetoscrum`.`projetos` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `projetoscrum`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `projetoscrum`.`sprints`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projetoscrum`.`sprints` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `projectId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `deliveryDate` DATE NOT NULL, -- Changed to DATE type
  PRIMARY KEY (`id`),
  INDEX `projectId` (`projectId` ASC) VISIBLE,
  CONSTRAINT `sprints_ibfk_1`
    FOREIGN KEY (`projectId`)
    REFERENCES `projetoscrum`.`projetos` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
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
 `deliveryDate` DATE NOT NULL, -- Changed to DATE type
  `tag` ENUM('Pendente', 'Em progresso', 'Concluido') NOT NULL DEFAULT 'Pendente',
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
    ON DELETE CASCADE)
ENGINE = InnoDB
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
  PRIMARY KEY (`id`),
  INDEX `projectId` (`projectId` ASC) VISIBLE,
  CONSTRAINT `sprintsfinalizadas_ibfk_1`
    FOREIGN KEY (`projectId`)
    REFERENCES `projetoscrum`.`projetos` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;