CREATE DATABASE IF NOT EXISTS tecnico;
USE tecnico;

CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO usuario (username, password)
VALUES ('admin', '12345'), ('alumno', '2026');

CREATE TABLE IF NOT EXISTS cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tecnico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    fecha DATE NOT NULL,
    CONSTRAINT fk_servicio_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_servicio_tecnico
        FOREIGN KEY (tecnico_id) REFERENCES tecnico(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

SHOW TABLES;
