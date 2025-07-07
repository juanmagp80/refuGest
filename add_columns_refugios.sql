-- Script SQL para añadir las nuevas columnas a la tabla refugios
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE refugios 
ADD COLUMN IF NOT EXISTS adopta TEXT,
ADD COLUMN IF NOT EXISTS socio TEXT,
ADD COLUMN IF NOT EXISTS voluntario TEXT,
ADD COLUMN IF NOT EXISTS difunde TEXT,
ADD COLUMN IF NOT EXISTS dona TEXT;

-- Comentario opcional: Estas columnas almacenarán texto descriptivo para cada sección
-- adopta: Texto para la sección de adopción
-- socio: Texto para la sección de hacerse socio
-- voluntario: Texto para la sección de voluntariado
-- difunde: Texto para la sección de difusión
-- dona: Texto para la sección de donaciones
