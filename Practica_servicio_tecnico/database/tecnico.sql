CREATE DATABASE tecnico;

USE tecnico;

-----Crea la tabla:-----

CREATE TABLE usuario (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL
);
-----Agrega usuarios de prueba:----

INSERT INTO usuario (username, password)
VALUES ('admin', '12345');
INSERT INTO usuario (username, password)
VALUES ('alumno', '2026');

SELECT * FROM usuario;