-- COPIA Y PEGA ESTE CÓDIGO EN EL SQL EDITOR DE SUPABASE Y DALE A "RUN"

-- 1. Función para CREAR prendas desde la web (Esquema Público)
CREATE OR REPLACE FUNCTION public.crear_prenda_vint(
  p_titulo VARCHAR,
  p_descripcion VARCHAR,
  p_precio numeric,
  p_categoria INT,
  p_image_url VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_correo VARCHAR;
  v_id_usuario INT;
  v_id_prenda INT;
BEGIN
  -- Obtener el email del usuario logueado usando Supabase Auth
  v_correo := auth.jwt() ->> 'email';
  
  IF v_correo IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  -- Buscar al usuario en la base de datos real
  SELECT id_usuario INTO v_id_usuario 
  FROM seguridad.usuarios 
  WHERE correo = v_correo;

  IF v_id_usuario IS NULL THEN
    RAISE EXCEPTION 'El usuario % no existe en la base de datos.', v_correo;
  END IF;

  -- Insertar la prenda en el esquema oculto
  INSERT INTO catalogo.prendas (
    id_usuario, id_categoria, id_marca, titulo, descripcion, precio, talla, color, genero, condicion
  ) VALUES (
    v_id_usuario, p_categoria, 1, p_titulo, COALESCE(p_descripcion, ''), p_precio, 'M', 'N/A', 'Unisex', 'Nuevo'
  ) RETURNING id_prenda INTO v_id_prenda;

  -- Insertar la imagen conectada a la prenda
  IF p_image_url IS NOT NULL THEN
    INSERT INTO catalogo.imagenes_prendas (id_prenda, url_imagen, es_principal, orden)
    VALUES (v_id_prenda, p_image_url, TRUE, 0);
  END IF;

  RETURN jsonb_build_object('id_prenda', v_id_prenda);
END;
$$;

-- 2. Función para EDITAR prendas
CREATE OR REPLACE FUNCTION public.editar_prenda_vint(
  p_id_prenda INT,
  p_titulo VARCHAR,
  p_descripcion VARCHAR,
  p_precio numeric
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE catalogo.prendas
  SET titulo = p_titulo, descripcion = COALESCE(p_descripcion, descripcion), precio = p_precio
  WHERE id_prenda = p_id_prenda;
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 3. Función para ELIMINAR prendas
CREATE OR REPLACE FUNCTION public.eliminar_prenda_vint(
  p_id_prenda INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Primero borrar imágenes dependientes para evitar errores de llave foránea
  DELETE FROM catalogo.imagenes_prendas WHERE id_prenda = p_id_prenda;
  -- Borrar de carrito_detalle si existe
  DELETE FROM ventas.carrito_detalle WHERE id_prenda = p_id_prenda;
  -- Finalmente borrar la prenda
  DELETE FROM catalogo.prendas WHERE id_prenda = p_id_prenda;
  
  RETURN jsonb_build_object('success', true);
END;
$$;
