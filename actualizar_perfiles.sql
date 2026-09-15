-- =============================================================================
-- VINT: ACTUALIZACIÓN DE PERFILES, AVATARES Y VISTAS PÚBLICAS
-- Copia y pega este script en el "SQL Editor" de tu panel de Supabase y dale "Run".
-- =============================================================================

-- 1. AGREGAR COLUMNAS A seguridad.usuarios
-- Buenas prácticas: Uso de IF NOT EXISTS y tipos de datos adecuados con restricciones
ALTER TABLE seguridad.usuarios 
  ADD COLUMN IF NOT EXISTS username VARCHAR(60) UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS descripcion VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100) DEFAULT 'Colombia';

-- Crear índice para búsquedas ultra-rápidas por username
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON seguridad.usuarios (LOWER(username));

-- 2. POBLAR USERNAMES INICIALES PARA REGISTROS EXISTENTES (MIGRACIÓN SEGURA)
-- Si username está vacío, genera uno a partir del correo
UPDATE seguridad.usuarios
SET username = LOWER(SPLIT_PART(correo, '@', 1))
WHERE username IS NULL;

-- 3. ACTUALIZAR O RECREAR LA VISTA PÚBLICA DE USUARIOS (public.v_usuarios_publico)
-- Esta vista permite a la aplicación y a los visitantes ver la información pública
-- de cualquier vendedor o comprador sin exponer contraseñas, teléfonos ni datos sensibles.
DROP VIEW IF EXISTS public.v_usuarios_publico CASCADE;

CREATE OR REPLACE VIEW public.v_usuarios_publico AS
SELECT 
  u.id_usuario,
  u.id_auth_supabase,
  u.correo,
  u.primer_nombre,
  u.primer_apellido,
  TRIM(CONCAT(u.primer_nombre, ' ', COALESCE(u.segundo_nombre, ''), ' ', u.primer_apellido, ' ', COALESCE(u.segundo_apellido, ''))) AS nombre_completo,
  u.username,
  u.avatar_url,
  u.descripcion,
  COALESCE(u.ciudad, 'Colombia') AS ciudad,
  u.fecha_registro,
  r.nombre AS rol,
  -- Conteo en tiempo real de ventas exitosas (el mayor entre pedidos completados o prendas vendidas, sin duplicar)
  GREATEST(
    COALESCE((
      SELECT COUNT(*)::INT 
      FROM public.pedidos p 
      WHERE p.vendedor_id = u.id_auth_supabase AND p.estado = 'completado'
    ), 0),
    COALESCE((
      SELECT COUNT(*)::INT 
      FROM catalogo.prendas pr 
      WHERE pr.id_usuario = u.id_usuario AND pr.estado_publicacion = 'VENDIDA'
    ), 0)
  ) AS ventas_exitosas,
  -- Conteo de prendas activas actualmente disponibles
  COALESCE((
    SELECT COUNT(*)::INT 
    FROM catalogo.prendas pr 
    WHERE pr.id_usuario = u.id_usuario AND pr.estado_publicacion = 'DISPONIBLE'
  ), 0) AS prendas_disponibles
FROM seguridad.usuarios u
LEFT JOIN seguridad.roles r ON u.id_rol = r.id_rol
WHERE u.activo = TRUE;

-- Otorgar permisos de lectura a usuarios anónimos y autenticados
GRANT SELECT ON public.v_usuarios_publico TO anon, authenticated, service_role;


-- 4. ACTUALIZAR LA VISTA DE CATÁLOGO PÚBLICO (catalogo.v_catalogo_publico)
-- Para que cada prenda incluya DIRECTAMENTE el avatar y el username del vendedor.
-- De esta forma el modal de producto y el explorador no tienen que hacer llamadas extra.
DROP VIEW IF EXISTS public.v_catalogo_publico CASCADE;
DROP VIEW IF EXISTS catalogo.v_catalogo_publico CASCADE;

CREATE OR REPLACE VIEW catalogo.v_catalogo_publico AS
SELECT 
  p.id_prenda,
  p.titulo,
  p.descripcion,
  c.nombre AS categoria,
  m.nombre AS marca,
  p.talla,
  p.color,
  p.precio,
  p.genero,
  p.condicion,
  p.fecha_publicacion,
  TRIM(CONCAT(u.primer_nombre, ' ', u.primer_apellido)) AS vendedor,
  u.correo AS correo_vendedor,
  u.username AS username_vendedor,
  u.avatar_url AS avatar_vendedor,
  (
    SELECT ip.url_imagen 
    FROM catalogo.imagenes_prendas ip 
    WHERE ip.id_prenda = p.id_prenda 
    ORDER BY ip.es_principal DESC, ip.orden ASC, ip.id_imagen ASC 
    LIMIT 1
  ) AS imagen_principal
FROM catalogo.prendas p
LEFT JOIN catalogo.categorias c ON p.id_categoria = c.id_categoria
LEFT JOIN catalogo.marcas m ON p.id_marca = m.id_marca
LEFT JOIN seguridad.usuarios u ON p.id_usuario = u.id_usuario
WHERE p.estado_publicacion = 'DISPONIBLE';

-- Exponer en el esquema public para compatibilidad con PostgREST
CREATE OR REPLACE VIEW public.v_catalogo_publico AS
SELECT * FROM catalogo.v_catalogo_publico;

GRANT SELECT ON catalogo.v_catalogo_publico TO anon, authenticated, service_role;
GRANT SELECT ON public.v_catalogo_publico TO anon, authenticated, service_role;


-- 5. FUNCIÓN RPC PARA ACTUALIZAR PERFIL DESDE EL FRONTEND CON SEGURIDAD (SECURITY DEFINER)
-- Permite actualizar nombre, username, descripcion y avatar_url en la base de datos
-- garantizando que solo el usuario autenticado pueda modificar sus propios datos.
CREATE OR REPLACE FUNCTION public.actualizar_mi_perfil_vint(
  p_nombre VARCHAR,
  p_username VARCHAR,
  p_descripcion VARCHAR,
  p_avatar_url TEXT DEFAULT NULL,
  p_ciudad VARCHAR DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_correo VARCHAR;
  v_parts TEXT[];
  v_primer_nombre VARCHAR;
  v_segundo_nombre VARCHAR := '';
  v_primer_apellido VARCHAR := '';
  v_segundo_apellido VARCHAR := '';
BEGIN
  -- 1. Validar autenticación
  v_user_id := auth.uid();
  v_correo := auth.jwt() ->> 'email';
  
  IF v_user_id IS NULL AND v_correo IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  -- 2. Validar que el username no esté tomado por otro usuario
  IF p_username IS NOT NULL AND p_username <> '' THEN
    IF EXISTS (
      SELECT 1 FROM seguridad.usuarios 
      WHERE LOWER(username) = LOWER(p_username) 
        AND (id_auth_supabase IS DISTINCT FROM v_user_id)
        AND (correo IS DISTINCT FROM v_correo)
    ) THEN
      RAISE EXCEPTION 'El nombre de usuario "@%" ya está en uso por otra persona.', p_username;
    END IF;
  END IF;

  -- 3. Descomponer el nombre ingresado
  v_parts := regexp_split_to_array(TRIM(p_nombre), '\s+');
  v_primer_nombre := COALESCE(v_parts[1], '');

  IF array_length(v_parts, 1) = 2 THEN
    v_primer_apellido := v_parts[2];
  ELSIF array_length(v_parts, 1) = 3 THEN
    v_segundo_nombre := v_parts[2];
    v_primer_apellido := v_parts[3];
  ELSIF array_length(v_parts, 1) >= 4 THEN
    v_segundo_nombre := v_parts[2];
    v_primer_apellido := v_parts[3];
    v_segundo_apellido := array_to_string(v_parts[4:array_length(v_parts, 1)], ' ');
  END IF;

  -- 4. Actualizar tabla seguridad.usuarios
  UPDATE seguridad.usuarios
  SET 
    primer_nombre = COALESCE(NULLIF(v_primer_nombre, ''), primer_nombre),
    segundo_nombre = NULLIF(v_segundo_nombre, ''),
    primer_apellido = COALESCE(NULLIF(v_primer_apellido, ''), primer_apellido),
    segundo_apellido = NULLIF(v_segundo_apellido, ''),
    username = COALESCE(NULLIF(LOWER(TRIM(p_username)), ''), username),
    descripcion = COALESCE(p_descripcion, descripcion),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    ciudad = COALESCE(p_ciudad, ciudad)
  WHERE id_auth_supabase = v_user_id OR correo = v_correo;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Perfil actualizado correctamente'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.actualizar_mi_perfil_vint TO authenticated;


-- 6. POLÍTICAS DE ACCESO PARA STORAGE (BUCKET 'avatars')
-- Permite que los usuarios autenticados puedan subir avatares y que cualquiera pueda verlos públicamente
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permitir lectura pública de avatares
DROP POLICY IF EXISTS "Avatares lectura pública" ON storage.objects;
CREATE POLICY "Avatares lectura pública" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Permitir subida de avatares a usuarios autenticados
DROP POLICY IF EXISTS "Avatares subida autenticados" ON storage.objects;
CREATE POLICY "Avatares subida autenticados" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

-- Permitir actualización de avatares a usuarios autenticados
DROP POLICY IF EXISTS "Avatares actualización autenticados" ON storage.objects;
CREATE POLICY "Avatares actualización autenticados" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'avatars');


-- 7. ACTUALIZAR LA VISTA DE DASHBOARD DE VENDEDORES (seguridad.v_dashboard_vendedores)
-- Utilizada por la API (/api/vendedor/stats) y la app móvil para calcular ingresos y ventas reales
DROP VIEW IF EXISTS seguridad.v_dashboard_vendedores CASCADE;

CREATE OR REPLACE VIEW seguridad.v_dashboard_vendedores AS
SELECT 
  u.id_usuario,
  TRIM(CONCAT(u.primer_nombre, ' ', u.primer_apellido)) AS vendedor,
  u.correo,
  -- Total de prendas publicadas históricas
  COALESCE((
    SELECT COUNT(*)::BIGINT 
    FROM catalogo.prendas pr 
    WHERE pr.id_usuario = u.id_usuario
  ), 0) AS total_publicadas,
  -- Prendas disponibles actualmente
  COALESCE((
    SELECT COUNT(*)::BIGINT 
    FROM catalogo.prendas pr 
    WHERE pr.id_usuario = u.id_usuario AND pr.estado_publicacion = 'DISPONIBLE'
  ), 0) AS disponibles,
  -- Prendas vendidas
  GREATEST(
    COALESCE((
      SELECT COUNT(*)::BIGINT 
      FROM public.pedidos p 
      WHERE p.vendedor_id = u.id_auth_supabase AND p.estado = 'completado'
    ), 0),
    COALESCE((
      SELECT COUNT(*)::BIGINT 
      FROM catalogo.prendas pr 
      WHERE pr.id_usuario = u.id_usuario AND pr.estado_publicacion = 'VENDIDA'
    ), 0)
  ) AS vendidas,
  -- Prendas pausadas
  COALESCE((
    SELECT COUNT(*)::BIGINT 
    FROM catalogo.prendas pr 
    WHERE pr.id_usuario = u.id_usuario AND pr.estado_publicacion = 'PAUSADA'
  ), 0) AS pausadas,
  -- Ingresos totales reales (suma de precios de ventas completadas)
  COALESCE((
    SELECT SUM(COALESCE(p.precio, p.total))::NUMERIC 
    FROM public.pedidos p 
    WHERE p.vendedor_id = u.id_auth_supabase AND p.estado = 'completado'
  ), 0) AS ingresos_totales,
  -- Precio promedio vendido
  COALESCE((
    SELECT AVG(COALESCE(p.precio, p.total))::NUMERIC 
    FROM public.pedidos p 
    WHERE p.vendedor_id = u.id_auth_supabase AND p.estado = 'completado'
  ), 0) AS precio_promedio_vendido
FROM seguridad.usuarios u
WHERE u.activo = TRUE;

GRANT SELECT ON seguridad.v_dashboard_vendedores TO anon, authenticated, service_role;

