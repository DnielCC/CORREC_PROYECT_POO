-- Script para revertir los cambios de la base de datos
-- Eliminar el campo fecha_ultima_actualizacion si existe

USE bolsa_trabajo_2;

-- Verificar si el campo existe antes de eliminarlo
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'bolsa_trabajo_2' 
     AND TABLE_NAME = 'postulaciones' 
     AND COLUMN_NAME = 'fecha_ultima_actualizacion') > 0,
    'ALTER TABLE postulaciones DROP COLUMN fecha_ultima_actualizacion',
    'SELECT "El campo fecha_ultima_actualizacion no existe" as mensaje'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar la estructura actual de la tabla postulaciones
DESCRIBE postulaciones;
