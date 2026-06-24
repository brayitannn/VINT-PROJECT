-- Eliminar trigger roto si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear función del trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = seguridad, public
AS $$
DECLARE
  v_id_rol INT;
BEGIN
  v_id_rol := COALESCE((NEW.raw_user_meta_data->>'id_rol')::INT, 1);

  INSERT INTO seguridad.usuarios (
    id_rol,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    correo,
    telefono
  ) VALUES (
    v_id_rol,
    COALESCE(NEW.raw_user_meta_data->>'primer_nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'segundo_nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'primer_apellido', ''),
    COALESCE(NEW.raw_user_meta_data->>'segundo_apellido', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefono', '')
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error trigger: % - %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$;

-- Crear trigger nuevo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
