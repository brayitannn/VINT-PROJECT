-- ════════════════════════════════════════════════════════════
--  SCRIPT DE PERMISOS, TRIGGER Y DATOS INICIALES
--  Ejecutar en el SQL Editor de Supabase
-- ════════════════════════════════════════════════════════════

-- 1. Crear el esquema seguridad si no existe
CREATE SCHEMA IF NOT EXISTS seguridad;

-- 2. Asegurar que la columna id_auth_supabase exista en seguridad.usuarios
-- (Esto mapea el ID de autenticación de Supabase a nuestra tabla de negocio)
ALTER TABLE seguridad.usuarios ADD COLUMN IF NOT EXISTS id_auth_supabase UUID UNIQUE;

-- 3. Tabla de permisos del sistema
CREATE TABLE IF NOT EXISTS seguridad.permisos (
    id_permiso   SERIAL       PRIMARY KEY,
    nombre       VARCHAR(50)  NOT NULL UNIQUE,
    descripcion  VARCHAR(200)
);

COMMENT ON TABLE seguridad.permisos IS
    'Catálogo de permisos disponibles en la plataforma Vint.';

-- 4. Tabla relación N:N entre roles y permisos
CREATE TABLE IF NOT EXISTS seguridad.rol_permisos (
    id_rol       INT NOT NULL REFERENCES seguridad.roles(id_rol) ON DELETE CASCADE,
    id_permiso   INT NOT NULL REFERENCES seguridad.permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

COMMENT ON TABLE seguridad.rol_permisos IS
    'Asignación de permisos a roles. Un rol puede tener múltiples permisos.';

-- 5. Datos iniciales de permisos
INSERT INTO seguridad.permisos (nombre, descripcion) VALUES
    ('gestionar_usuarios',   'Ver listado y modificar estado de usuarios registrados'),
    ('eliminar_usuarios',    'Eliminar permanentemente usuarios de la plataforma'),
    ('gestionar_roles',      'Crear, editar y eliminar roles del sistema'),
    ('asignar_permisos',     'Asignar y revocar permisos a los roles'),
    ('ver_dashboard_admin',  'Acceder al panel de administración')
ON CONFLICT (nombre) DO NOTHING;

-- 6. Asignar todos los permisos al rol ADMIN
DO $$
DECLARE
    v_admin_id INT;
BEGIN
    SELECT id_rol INTO v_admin_id FROM seguridad.roles WHERE nombre = 'ADMIN';
    
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO seguridad.rol_permisos (id_rol, id_permiso)
        SELECT v_admin_id, id_permiso FROM seguridad.permisos
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Permisos asignados al rol ADMIN (id_rol = %).', v_admin_id;
    ELSE
        RAISE WARNING 'No se encontró el rol ADMIN en seguridad.roles.';
    END IF;
END;
$$;

-- 7. RLS para las nuevas tablas (acceso solo desde service_role / backend)
ALTER TABLE seguridad.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguridad.rol_permisos ENABLE ROW LEVEL SECURITY;

-- Políticas: solo lectura para usuarios autenticados
CREATE POLICY "Lectura permisos autenticados" ON seguridad.permisos
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Lectura rol_permisos autenticados" ON seguridad.rol_permisos
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 8. Función Trigger para sincronizar auth.users con seguridad.usuarios automáticamente
CREATE OR REPLACE FUNCTION seguridad.tg_fn_sync_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_id_rol INT;
    v_raw_role VARCHAR;
BEGIN
    -- Obtener el rol del metadata del usuario, por defecto COMPRADOR (id_rol = 3)
    v_raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'comprador'));
    
    IF v_raw_role = 'admin' THEN
        SELECT id_rol INTO v_id_rol FROM seguridad.roles WHERE nombre = 'ADMIN';
    ELSIF v_raw_role = 'vendedor' THEN
        SELECT id_rol INTO v_id_rol FROM seguridad.roles WHERE nombre = 'VENDEDOR';
    ELSE
        SELECT id_rol INTO v_id_rol FROM seguridad.roles WHERE nombre = 'COMPRADOR';
    END IF;
    
    -- Si no se encuentra el rol en la base de datos, usar por defecto 3
    IF v_id_rol IS NULL THEN
        v_id_rol := 3;
    END IF;

    -- Insertar en nuestra tabla relacional seguridad.usuarios
    INSERT INTO seguridad.usuarios (
        id_rol,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        correo,
        telefono,
        contrasena, -- Contraseña local no requerida ya que se delega en Supabase Auth
        id_auth_supabase,
        activo
    ) VALUES (
        v_id_rol,
        COALESCE(new.raw_user_meta_data->>'primer_nombre', 'Nuevo'),
        new.raw_user_meta_data->>'segundo_nombre',
        COALESCE(new.raw_user_meta_data->>'primer_apellido', 'Usuario'),
        new.raw_user_meta_data->>'segundo_apellido',
        new.email,
        COALESCE(SUBSTRING(new.raw_user_meta_data->>'telefono' FROM 1 FOR 10), ''),
        'supabase_managed',
        new.id,
        COALESCE((new.raw_user_meta_data->>'activo')::boolean, TRUE)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Vincular Trigger a la tabla auth.users
DROP TRIGGER IF EXISTS tr_sync_new_user ON auth.users;
CREATE TRIGGER tr_sync_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION seguridad.tg_fn_sync_new_user();
