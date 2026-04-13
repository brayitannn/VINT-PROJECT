-- ════════════════════════════════════════════════════════════
--  STORED PROCEDURES
-- ════════════════════════════════════════════════════════════
 
-- SP 1 ─ Registrar un nuevo usuario
CREATE OR REPLACE PROCEDURE seguridad.sp_registrar_usuario(
    p_id_rol          INT,
    p_primer_nombre   VARCHAR,
    p_segundo_nombre  VARCHAR,
    p_primer_apellido VARCHAR,
    p_segundo_apellido VARCHAR,
    p_correo          VARCHAR,
    p_telefono        CHAR,
    p_contrasena_hash VARCHAR   -- Hash bcrypt generado en el backend
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Verificar que el correo no exista
    IF EXISTS (SELECT 1 FROM seguridad.usuarios WHERE correo = p_correo) THEN
        RAISE EXCEPTION 'El correo % ya está registrado.', p_correo;
    END IF;
 
    -- Verificar que el rol exista
    IF NOT EXISTS (SELECT 1 FROM seguridad.roles WHERE id_rol = p_id_rol) THEN
        RAISE EXCEPTION 'El rol con id % no existe.', p_id_rol;
    END IF;
 
    INSERT INTO seguridad.usuarios
        (id_rol, primer_nombre, segundo_nombre, primer_apellido,
         segundo_apellido, correo, telefono, contrasena)
    VALUES
        (p_id_rol, p_primer_nombre, p_segundo_nombre, p_primer_apellido,
         p_segundo_apellido, p_correo, p_telefono, p_contrasena_hash);
 
    RAISE NOTICE 'Usuario % registrado exitosamente.', p_correo;
END;
$$;
 
COMMENT ON PROCEDURE seguridad.sp_registrar_usuario IS
    'Registra un nuevo usuario. Valida correo único y existencia del rol.';
    
 
 
-- SP 2 ─ Publicar una nueva prenda
CREATE OR REPLACE PROCEDURE catalogo.sp_publicar_prenda(
    p_correo_vendedor VARCHAR,
    p_id_categoria    INT,
    p_id_marca        INT,
    p_titulo          VARCHAR,
    p_descripcion     VARCHAR,
    p_talla           VARCHAR,
    p_color           VARCHAR,
    p_precio          DECIMAL,
    p_genero          VARCHAR,
    p_condicion       VARCHAR,
    p_url_imagen      VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_usuario INT;
    v_id_prenda  INT;
BEGIN
    -- Obtener el id del vendedor por correo
    SELECT id_usuario INTO v_id_usuario
    FROM seguridad.usuarios
    WHERE correo = p_correo_vendedor AND activo = TRUE;
 
    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION 'No se encontró un usuario activo con correo %.', p_correo_vendedor;
    END IF;
 
    -- Validar precio mínimo
    IF p_precio < 1000 THEN
        RAISE EXCEPTION 'El precio mínimo permitido es $1.000. Precio ingresado: %.', p_precio;
    END IF;
 
    -- Insertar la prenda
    INSERT INTO catalogo.prendas
        (id_usuario, id_categoria, id_marca, titulo, descripcion,
         talla, color, precio, genero, condicion)
    VALUES
        (v_id_usuario, p_id_categoria, p_id_marca, p_titulo, p_descripcion,
         p_talla, p_color, p_precio, p_genero, p_condicion)
    RETURNING id_prenda INTO v_id_prenda;
 
    -- Insertar imagen principal si se proporcionó
    IF p_url_imagen IS NOT NULL THEN
        INSERT INTO catalogo.imagenes_prendas (id_prenda, url_imagen, es_principal, orden)
        VALUES (v_id_prenda, p_url_imagen, TRUE, 0);
    END IF;
 
    RAISE NOTICE 'Prenda publicada con id % por el usuario %.', v_id_prenda, p_correo_vendedor;
END;
$$;
 
COMMENT ON PROCEDURE catalogo.sp_publicar_prenda IS
    'Publica una prenda nueva. Valida usuario activo, precio mínimo e inserta imagen opcional.';
 
 
-- SP 3 ─ Agregar prenda al carrito
CREATE OR REPLACE PROCEDURE ventas.sp_agregar_al_carrito(
    p_correo_comprador VARCHAR,
    p_id_prenda        INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_usuario  INT;
    v_id_carrito  INT;
    v_precio      DECIMAL;
    v_id_vendedor INT;
BEGIN
    -- Obtener comprador
    SELECT id_usuario INTO v_id_usuario
    FROM seguridad.usuarios
    WHERE correo = p_correo_comprador AND activo = TRUE;
 
    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION 'Usuario % no encontrado o inactivo.', p_correo_comprador;
    END IF;
 
    -- Obtener datos de la prenda
    SELECT precio, id_usuario INTO v_precio, v_id_vendedor
    FROM catalogo.prendas
    WHERE id_prenda = p_id_prenda AND estado_publicacion = 'DISPONIBLE';
 
    IF v_precio IS NULL THEN
        RAISE EXCEPTION 'La prenda % no está disponible.', p_id_prenda;
    END IF;
 
    -- Evitar que el vendedor compre su propia prenda
    IF v_id_vendedor = v_id_usuario THEN
        RAISE EXCEPTION 'No puedes agregar al carrito una prenda que tú mismo publicaste.';
    END IF;
 
    -- Verificar que la prenda no esté ya en otro carrito activo
    IF EXISTS (
        SELECT 1 FROM ventas.carrito_detalle cd
        JOIN ventas.carritos c ON c.id_carrito = cd.id_carrito
        WHERE cd.id_prenda = p_id_prenda AND c.estado = 'ACTIVO'
    ) THEN
        RAISE EXCEPTION 'La prenda % ya está reservada en otro carrito activo.', p_id_prenda;
    END IF;
 
    -- Buscar carrito activo del comprador; si no existe, crearlo
    SELECT id_carrito INTO v_id_carrito
    FROM ventas.carritos
    WHERE id_comprador = v_id_usuario AND estado = 'ACTIVO'
    LIMIT 1;
 
    IF v_id_carrito IS NULL THEN
        INSERT INTO ventas.carritos (id_comprador, estado)
        VALUES (v_id_usuario, 'ACTIVO')
        RETURNING id_carrito INTO v_id_carrito;
    END IF;
 
    -- Agregar prenda al carrito
    INSERT INTO ventas.carrito_detalle (id_carrito, id_prenda, precio)
    VALUES (v_id_carrito, p_id_prenda, v_precio);
 
    RAISE NOTICE 'Prenda % agregada al carrito % del usuario %.', p_id_prenda, v_id_carrito, p_correo_comprador;
END;
$$;
 
COMMENT ON PROCEDURE ventas.sp_agregar_al_carrito IS
    'Agrega una prenda al carrito activo del comprador. Crea el carrito si no existe. Valida disponibilidad y que no sea prenda propia.';
 
 
-- SP 4 ─ Procesar compra completa (carrito → factura)
CREATE OR REPLACE PROCEDURE ventas.sp_procesar_compra(
    p_correo_comprador VARCHAR,
    p_metodo_pago      VARCHAR   -- 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_usuario  INT;
    v_id_carrito  INT;
    v_total       DECIMAL;
    v_id_factura  INT;
    v_num_factura VARCHAR;
    v_prenda      RECORD;
BEGIN
    -- Validar método de pago
    IF p_metodo_pago NOT IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') THEN
        RAISE EXCEPTION 'Método de pago inválido: %. Use EFECTIVO, TARJETA o TRANSFERENCIA.', p_metodo_pago;
    END IF;
 
    -- Obtener comprador
    SELECT id_usuario INTO v_id_usuario
    FROM seguridad.usuarios
    WHERE correo = p_correo_comprador AND activo = TRUE;
 
    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION 'Usuario % no encontrado.', p_correo_comprador;
    END IF;
 
    -- Obtener carrito activo
    SELECT id_carrito INTO v_id_carrito
    FROM ventas.carritos
    WHERE id_comprador = v_id_usuario AND estado = 'ACTIVO'
    LIMIT 1;
 
    IF v_id_carrito IS NULL THEN
        RAISE EXCEPTION 'El usuario % no tiene un carrito activo.', p_correo_comprador;
    END IF;
 
    -- Calcular total del carrito
    SELECT COALESCE(SUM(precio), 0) INTO v_total
    FROM ventas.carrito_detalle
    WHERE id_carrito = v_id_carrito;
 
    IF v_total = 0 THEN
        RAISE EXCEPTION 'El carrito % está vacío.', v_id_carrito;
    END IF;
 
    -- Generar número de factura único
    v_num_factura := 'FAC-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                     LPAD((
                         SELECT COUNT(*) + 1 FROM facturacion.facturas
                     )::TEXT, 4, '0');
 
    -- Crear la factura
    INSERT INTO facturacion.facturas
        (id_carrito, numero_factura, subtotal, total, metodo_pago, estado_factura)
    VALUES
        (v_id_carrito, v_num_factura, v_total, v_total, p_metodo_pago, 'PAGADA')
    RETURNING id_factura INTO v_id_factura;
 
    -- Insertar detalle de factura y marcar prendas como VENDIDAS
    FOR v_prenda IN
        SELECT id_prenda, precio FROM ventas.carrito_detalle WHERE id_carrito = v_id_carrito
    LOOP
        INSERT INTO facturacion.factura_detalle (id_factura, id_prenda, precio_unitario)
        VALUES (v_id_factura, v_prenda.id_prenda, v_prenda.precio);
 
        UPDATE catalogo.prendas
        SET estado_publicacion = 'VENDIDA'
        WHERE id_prenda = v_prenda.id_prenda;
    END LOOP;
 
    -- Cerrar el carrito
    UPDATE ventas.carritos
    SET estado = 'COMPRADO'
    WHERE id_carrito = v_id_carrito;
 
    RAISE NOTICE 'Compra procesada. Factura: % | Total: $% | Carrito: %',
                 v_num_factura, v_total, v_id_carrito;
END;
$$;
 
COMMENT ON PROCEDURE ventas.sp_procesar_compra IS
    'Procesa la compra completa: crea factura, marca prendas como VENDIDAS y cierra el carrito.';
 
 
-- SP 5 ─ Cancelar carrito
CREATE OR REPLACE PROCEDURE ventas.sp_cancelar_carrito(
    p_correo_comprador VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_usuario INT;
    v_id_carrito INT;
BEGIN
    SELECT id_usuario INTO v_id_usuario
    FROM seguridad.usuarios
    WHERE correo = p_correo_comprador;
 
    SELECT id_carrito INTO v_id_carrito
    FROM ventas.carritos
    WHERE id_comprador = v_id_usuario AND estado = 'ACTIVO'
    LIMIT 1;
 
    IF v_id_carrito IS NULL THEN
        RAISE EXCEPTION 'No se encontró un carrito activo para %.', p_correo_comprador;
    END IF;
 
    -- Eliminar el detalle del carrito
    DELETE FROM ventas.carrito_detalle WHERE id_carrito = v_id_carrito;
 
    -- Marcar carrito como cancelado
    UPDATE ventas.carritos SET estado = 'CANCELADO' WHERE id_carrito = v_id_carrito;
 
    RAISE NOTICE 'Carrito % cancelado para el usuario %.', v_id_carrito, p_correo_comprador;
END;
$$;
 
COMMENT ON PROCEDURE ventas.sp_cancelar_carrito IS
    'Cancela el carrito activo de un usuario y libera las prendas reservadas.';
 
 
-- SP 6 ─ Editar precio y descripción de una prenda (solo el propietario)
CREATE OR REPLACE PROCEDURE catalogo.sp_editar_prenda(
    p_correo_vendedor VARCHAR,
    p_id_prenda       INT,
    p_nuevo_precio    DECIMAL      DEFAULT NULL,
    p_nueva_desc      VARCHAR      DEFAULT NULL,
    p_nuevo_estado    VARCHAR      DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_usuario INT;
BEGIN
    SELECT id_usuario INTO v_id_usuario
    FROM seguridad.usuarios WHERE correo = p_correo_vendedor;
 
    -- Validar que la prenda le pertenece
    IF NOT EXISTS (
        SELECT 1 FROM catalogo.prendas
        WHERE id_prenda = p_id_prenda AND id_usuario = v_id_usuario
    ) THEN
        RAISE EXCEPTION 'La prenda % no existe o no te pertenece.', p_id_prenda;
    END IF;
 
    -- Validar precio si se envió
    IF p_nuevo_precio IS NOT NULL AND p_nuevo_precio < 1000 THEN
        RAISE EXCEPTION 'El precio mínimo es $1.000.';
    END IF;
 
    -- Validar estado si se envió
    IF p_nuevo_estado IS NOT NULL AND p_nuevo_estado NOT IN ('DISPONIBLE','PAUSADA','VENDIDA') THEN
        RAISE EXCEPTION 'Estado inválido: %. Use DISPONIBLE, PAUSADA o VENDIDA.', p_nuevo_estado;
    END IF;
 
    UPDATE catalogo.prendas SET
        precio             = COALESCE(p_nuevo_precio, precio),
        descripcion        = COALESCE(p_nueva_desc,   descripcion),
        estado_publicacion = COALESCE(p_nuevo_estado, estado_publicacion)
    WHERE id_prenda = p_id_prenda;
 
    RAISE NOTICE 'Prenda % actualizada correctamente.', p_id_prenda;
END;
$$;
 
COMMENT ON PROCEDURE catalogo.sp_editar_prenda IS
    'Permite al propietario editar precio, descripción o estado de una prenda. Solo modifica los campos enviados.';
 
 
-- SP 7 ─ Anular una factura
CREATE OR REPLACE PROCEDURE facturacion.sp_anular_factura(
    p_numero_factura VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_factura INT;
    v_id_carrito INT;
    v_prenda     RECORD;
BEGIN
    SELECT id_factura, id_carrito INTO v_id_factura, v_id_carrito
    FROM facturacion.facturas
    WHERE numero_factura = p_numero_factura;
 
    IF v_id_factura IS NULL THEN
        RAISE EXCEPTION 'Factura % no encontrada.', p_numero_factura;
    END IF;
 
    IF (SELECT estado_factura FROM facturacion.facturas WHERE id_factura = v_id_factura) = 'ANULADA' THEN
        RAISE EXCEPTION 'La factura % ya está anulada.', p_numero_factura;
    END IF;
 
    -- Revertir prendas a DISPONIBLE
    FOR v_prenda IN
        SELECT id_prenda FROM facturacion.factura_detalle WHERE id_factura = v_id_factura
    LOOP
        UPDATE catalogo.prendas
        SET estado_publicacion = 'DISPONIBLE'
        WHERE id_prenda = v_prenda.id_prenda;
    END LOOP;
 
    -- Marcar factura como anulada
    UPDATE facturacion.facturas
    SET estado_factura = 'ANULADA'
    WHERE id_factura = v_id_factura;
 
    -- Reabrir el carrito asociado
    UPDATE ventas.carritos
    SET estado = 'ACTIVO'
    WHERE id_carrito = v_id_carrito;
 
    RAISE NOTICE 'Factura % anulada. Prendas revertidas a DISPONIBLE.', p_numero_factura;
END;
$$;
 
COMMENT ON PROCEDURE facturacion.sp_anular_factura IS
    'Anula una factura, revierte las prendas a DISPONIBLE y reabre el carrito.';


-- ════════════════════════════════════════════════════════════
--  FUNCTIONS
-- ════════════════════════════════════════════════════════════
 
-- FUNCTION 1 ─ Obtener prendas disponibles filtradas
--   Parámetros opcionales: categoría, precio mínimo, precio máximo,
--                          género, condición
CREATE OR REPLACE FUNCTION catalogo.fn_buscar_prendas(
    p_categoria  VARCHAR DEFAULT NULL,
    p_precio_min DECIMAL DEFAULT NULL,
    p_precio_max DECIMAL DEFAULT NULL,
    p_genero     VARCHAR DEFAULT NULL,
    p_condicion  VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id_prenda   INT,
    titulo      VARCHAR,
    categoria   VARCHAR,
    marca       VARCHAR,
    talla       VARCHAR,
    precio      DECIMAL,
    genero      VARCHAR,
    condicion   VARCHAR,
    imagen      VARCHAR
)
LANGUAGE sql STABLE AS $$
    SELECT
        p.id_prenda,
        p.titulo,
        cat.nombre,
        m.nombre,
        p.talla,
        p.precio,
        p.genero,
        p.condicion,
        i.url_imagen
    FROM catalogo.prendas p
    JOIN catalogo.categorias          cat ON cat.id_categoria = p.id_categoria
    JOIN catalogo.marcas                m ON m.id_marca       = p.id_marca
    LEFT JOIN catalogo.imagenes_prendas i ON i.id_prenda = p.id_prenda
                                          AND i.es_principal = TRUE
    WHERE p.estado_publicacion = 'DISPONIBLE'
      AND (p_categoria  IS NULL OR cat.nombre  ILIKE p_categoria)
      AND (p_precio_min IS NULL OR p.precio   >= p_precio_min)
      AND (p_precio_max IS NULL OR p.precio   <= p_precio_max)
      AND (p_genero     IS NULL OR p.genero    = p_genero)
      AND (p_condicion  IS NULL OR p.condicion = p_condicion)
    ORDER BY p.fecha_publicacion DESC;
$$;
 
COMMENT ON FUNCTION catalogo.fn_buscar_prendas IS
    'Busca prendas disponibles con filtros opcionales. Uso: SELECT * FROM catalogo.fn_buscar_prendas(''Chaquetas'', 50000, 200000, ''Hombre'', NULL)';
 
 
-- FUNCTION 2 ─ Calcular el total de un carrito
CREATE OR REPLACE FUNCTION ventas.fn_total_carrito(p_id_carrito INT)
RETURNS DECIMAL
LANGUAGE sql STABLE AS $$
    SELECT COALESCE(SUM(precio), 0)
    FROM ventas.carrito_detalle
    WHERE id_carrito = p_id_carrito;
$$;
 
COMMENT ON FUNCTION ventas.fn_total_carrito IS
    'Retorna el total acumulado de un carrito. Uso: SELECT ventas.fn_total_carrito(1)';
 
 
-- FUNCTION 3 ─ Obtener historial de compras de un usuario
CREATE OR REPLACE FUNCTION facturacion.fn_historial_usuario(p_correo VARCHAR)
RETURNS TABLE (
    numero_factura  VARCHAR,
    fecha_compra    TIMESTAMP,
    prenda          VARCHAR,
    categoria       VARCHAR,
    precio_pagado   DECIMAL,
    metodo_pago     VARCHAR,
    estado          VARCHAR
)
LANGUAGE sql STABLE AS $$
    SELECT
        f.numero_factura,
        f.fecha_factura,
        p.titulo,
        cat.nombre,
        fd.precio_unitario,
        f.metodo_pago,
        f.estado_factura
    FROM facturacion.facturas            f
    JOIN facturacion.factura_detalle    fd  ON fd.id_factura    = f.id_factura
    JOIN catalogo.prendas                p  ON p.id_prenda      = fd.id_prenda
    JOIN catalogo.categorias           cat  ON cat.id_categoria = p.id_categoria
    JOIN ventas.carritos                 c  ON c.id_carrito     = f.id_carrito
    JOIN seguridad.usuarios              u  ON u.id_usuario     = c.id_comprador
    WHERE u.correo = p_correo
    ORDER BY f.fecha_factura DESC;
$$;
 
COMMENT ON FUNCTION facturacion.fn_historial_usuario IS
    'Retorna el historial de compras de un usuario. Uso: SELECT * FROM facturacion.fn_historial_usuario(''manuela.moreno@gmail.com'')';
 
 
-- FUNCTION 4 ─ Verificar si una prenda puede agregarse al carrito
--   Retorna TRUE si está disponible y no está en otro carrito activo
CREATE OR REPLACE FUNCTION ventas.fn_prenda_disponible_para_carrito(p_id_prenda INT)
RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
    SELECT
        EXISTS (
            SELECT 1 FROM catalogo.prendas
            WHERE id_prenda = p_id_prenda
              AND estado_publicacion = 'DISPONIBLE'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM ventas.carrito_detalle cd
            JOIN ventas.carritos c ON c.id_carrito = cd.id_carrito
            WHERE cd.id_prenda = p_id_prenda
              AND c.estado = 'ACTIVO'
        );
$$;
 
COMMENT ON FUNCTION ventas.fn_prenda_disponible_para_carrito IS
    'Verifica si una prenda puede agregarse a un carrito (disponible y sin reserva activa).';
 
 
-- FUNCTION 5 ─ Resumen financiero de un vendedor
CREATE OR REPLACE FUNCTION seguridad.fn_resumen_vendedor(p_correo VARCHAR)
RETURNS TABLE (
    total_publicadas    BIGINT,
    disponibles         BIGINT,
    vendidas            BIGINT,
    ingresos_totales    DECIMAL,
    precio_promedio     NUMERIC,
    mejor_venta         DECIMAL
)
LANGUAGE sql STABLE AS $$
    SELECT
        COUNT(p.id_prenda)                                               AS total_publicadas,
        COUNT(p.id_prenda) FILTER (WHERE p.estado_publicacion = 'DISPONIBLE') AS disponibles,
        COUNT(p.id_prenda) FILTER (WHERE p.estado_publicacion = 'VENDIDA')    AS vendidas,
        COALESCE(SUM(fd.precio_unitario), 0)                            AS ingresos_totales,
        ROUND(COALESCE(AVG(fd.precio_unitario), 0), 0)                  AS precio_promedio,
        COALESCE(MAX(fd.precio_unitario), 0)                            AS mejor_venta
    FROM seguridad.usuarios             u
    JOIN catalogo.prendas               p  ON p.id_usuario  = u.id_usuario
    LEFT JOIN facturacion.factura_detalle fd ON fd.id_prenda = p.id_prenda
    LEFT JOIN facturacion.facturas        f  ON f.id_factura = fd.id_factura
                                           AND f.estado_factura = 'PAGADA'
    WHERE u.correo = p_correo;
$$;
 
COMMENT ON FUNCTION seguridad.fn_resumen_vendedor IS
    'Resumen financiero de un vendedor. Uso: SELECT * FROM seguridad.fn_resumen_vendedor(''camilo.gonzalez@gmail.com'')';

    -- ─────────────────────────────────────────
-- FUNCIÓN 6: calcular edad en años
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION seguridad.fn_calcular_edad(p_fecha_nacimiento DATE)
RETURNS INT
LANGUAGE sql STABLE AS $$
    SELECT
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_fecha_nacimiento))::INT;
$$;

COMMENT ON FUNCTION seguridad.fn_calcular_edad IS
    'Calcula la edad en años a partir de la fecha de nacimiento. Uso: SELECT seguridad.fn_calcular_edad(''2000-05-15'')';

-- ════════════════════════════════════════════════════════════
--  TRIGGERS
-- ════════════════════════════════════════════════════════════
 
-- TRIGGER 1 ─ Marcar prenda como VENDIDA al completarse la compra
--   Se activa al insertar en factura_detalle
CREATE OR REPLACE FUNCTION facturacion.tg_fn_marcar_prenda_vendida()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE catalogo.prendas
    SET estado_publicacion = 'VENDIDA'
    WHERE id_prenda = NEW.id_prenda;
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER tg_marcar_prenda_vendida
AFTER INSERT ON facturacion.factura_detalle
FOR EACH ROW
EXECUTE FUNCTION facturacion.tg_fn_marcar_prenda_vendida();
 
COMMENT ON TRIGGER tg_marcar_prenda_vendida ON facturacion.factura_detalle IS
    'Marca automáticamente la prenda como VENDIDA cuando se inserta en el detalle de una factura.';
 
 
-- TRIGGER 2 ─ Impedir agregar al carrito una prenda VENDIDA o PAUSADA
CREATE OR REPLACE FUNCTION ventas.tg_fn_validar_prenda_carrito()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_estado VARCHAR;
BEGIN
    SELECT estado_publicacion INTO v_estado
    FROM catalogo.prendas
    WHERE id_prenda = NEW.id_prenda;
 
    IF v_estado <> 'DISPONIBLE' THEN
        RAISE EXCEPTION
            'No se puede agregar la prenda % al carrito. Estado actual: %.',
            NEW.id_prenda, v_estado;
    END IF;
 
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER tg_validar_prenda_carrito
BEFORE INSERT ON ventas.carrito_detalle
FOR EACH ROW
EXECUTE FUNCTION ventas.tg_fn_validar_prenda_carrito();
 
COMMENT ON TRIGGER tg_validar_prenda_carrito ON ventas.carrito_detalle IS
    'Bloquea la inserción en carrito_detalle si la prenda no está DISPONIBLE.';
 
 
-- TRIGGER 3 ─ Impedir que un vendedor compre su propia prenda
CREATE OR REPLACE FUNCTION ventas.tg_fn_bloquear_autocompra()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_id_comprador INT;
    v_id_vendedor  INT;
BEGIN
    -- Obtener el comprador del carrito
    SELECT id_comprador INTO v_id_comprador
    FROM ventas.carritos
    WHERE id_carrito = NEW.id_carrito;
 
    -- Obtener el vendedor de la prenda
    SELECT id_usuario INTO v_id_vendedor
    FROM catalogo.prendas
    WHERE id_prenda = NEW.id_prenda;
 
    IF v_id_comprador = v_id_vendedor THEN
        RAISE EXCEPTION
            'No puedes comprar tu propia prenda (id_prenda: %).', NEW.id_prenda;
    END IF;
 
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER tg_bloquear_autocompra
BEFORE INSERT ON ventas.carrito_detalle
FOR EACH ROW
EXECUTE FUNCTION ventas.tg_fn_bloquear_autocompra();
 
COMMENT ON TRIGGER tg_bloquear_autocompra ON ventas.carrito_detalle IS
    'Impide que un usuario agregue al carrito una prenda publicada por él mismo.';
 
 
-- TRIGGER 4 ─ Auditoría: registrar cambios de precio en prendas
--   Primero se crea la tabla de auditoría
CREATE TABLE IF NOT EXISTS catalogo.auditoria_precios (
    id_auditoria     SERIAL      PRIMARY KEY,
    id_prenda        INT         NOT NULL,
    precio_anterior  DECIMAL,
    precio_nuevo     DECIMAL,
    fecha_cambio     TIMESTAMP   NOT NULL DEFAULT NOW(),
    usuario_db       VARCHAR     NOT NULL DEFAULT CURRENT_USER
);
 
CREATE OR REPLACE FUNCTION catalogo.tg_fn_auditoria_precio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.precio <> NEW.precio THEN
        INSERT INTO catalogo.auditoria_precios
            (id_prenda, precio_anterior, precio_nuevo)
        VALUES
            (NEW.id_prenda, OLD.precio, NEW.precio);
    END IF;
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER tg_auditoria_precio
AFTER UPDATE OF precio ON catalogo.prendas
FOR EACH ROW
EXECUTE FUNCTION catalogo.tg_fn_auditoria_precio();
 
COMMENT ON TRIGGER tg_auditoria_precio ON catalogo.prendas IS
    'Registra en auditoria_precios cada vez que se modifica el precio de una prenda.';
 
 
-- TRIGGER 5 ─ Al cancelar un carrito, liberar las prendas (no dejarlas bloqueadas)
CREATE OR REPLACE FUNCTION ventas.tg_fn_liberar_prendas_carrito()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Solo actúa cuando el estado cambia a CANCELADO
    IF NEW.estado = 'CANCELADO' AND OLD.estado = 'ACTIVO' THEN
        DELETE FROM ventas.carrito_detalle
        WHERE id_carrito = NEW.id_carrito;
 
        RAISE NOTICE 'Prendas del carrito % liberadas por cancelación.', NEW.id_carrito;
    END IF;
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER tg_liberar_prendas_cancelacion
AFTER UPDATE OF estado ON ventas.carritos
FOR EACH ROW
EXECUTE FUNCTION ventas.tg_fn_liberar_prendas_carrito();
 
COMMENT ON TRIGGER tg_liberar_prendas_cancelacion ON ventas.carritos IS
    'Elimina el detalle del carrito automáticamente cuando el estado cambia a CANCELADO.';
 
 
-- TRIGGER 6 ─ Validar que el correo del usuario sea único al actualizar
CREATE OR REPLACE FUNCTION seguridad.tg_fn_validar_correo_unico()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM seguridad.usuarios
        WHERE correo = NEW.correo AND id_usuario <> NEW.id_usuario
    ) THEN
        RAISE EXCEPTION 'El correo % ya está en uso por otro usuario.', NEW.correo;
    END IF;
    RETURN NEW;
END;
$$;
 
CREATE OR REPLACE TRIGGER tg_validar_correo_unico
BEFORE UPDATE OF correo ON seguridad.usuarios
FOR EACH ROW
EXECUTE FUNCTION seguridad.tg_fn_validar_correo_unico();
 
COMMENT ON TRIGGER tg_validar_correo_unico ON seguridad.usuarios IS
    'Valida que el correo no esté duplicado al actualizar los datos de un usuario.';

-- ════════════════════════════════════════════════════════════
--  VIEWS
-- ════════════════════════════════════════════════════════════
 
-- VIEW 1 ─ Catálogo público completo con imagen principal
CREATE OR REPLACE VIEW catalogo.v_catalogo_publico AS
SELECT
    p.id_prenda,
    p.titulo,
    p.descripcion,
    cat.nombre                                    AS categoria,
    m.nombre                                      AS marca,
    p.talla,
    p.color,
    p.precio,
    p.genero,
    p.condicion,
    p.fecha_publicacion,
    u.primer_nombre || ' ' || u.primer_apellido   AS vendedor,
    u.correo                                      AS correo_vendedor,
    i.url_imagen                                  AS imagen_principal
FROM catalogo.prendas p
JOIN catalogo.categorias          cat ON cat.id_categoria = p.id_categoria
JOIN catalogo.marcas                m ON m.id_marca       = p.id_marca
JOIN seguridad.usuarios             u ON u.id_usuario     = p.id_usuario
LEFT JOIN catalogo.imagenes_prendas i ON i.id_prenda = p.id_prenda
                                      AND i.es_principal = TRUE
WHERE p.estado_publicacion = 'DISPONIBLE';
 
COMMENT ON VIEW catalogo.v_catalogo_publico IS
    'Vista pública del catálogo: prendas disponibles con categoría, marca, vendedor e imagen principal.';
 
 
-- VIEW 2 ─ Resumen de carrito activo por usuario
CREATE OR REPLACE VIEW ventas.v_carrito_activo AS
SELECT
    c.id_carrito,
    u.id_usuario,
    u.primer_nombre || ' ' || u.primer_apellido  AS comprador,
    u.correo,
    COUNT(cd.id_prenda)                          AS cantidad_items,
    SUM(cd.precio)                               AS total_carrito,
    c.fecha_creacion,
    EXTRACT(DAY FROM NOW() - c.fecha_creacion)   AS dias_abierto
FROM ventas.carritos c
JOIN seguridad.usuarios       u  ON u.id_usuario = c.id_comprador
JOIN ventas.carrito_detalle  cd  ON cd.id_carrito = c.id_carrito
WHERE c.estado = 'ACTIVO'
GROUP BY c.id_carrito, u.id_usuario, u.primer_nombre,
         u.primer_apellido, u.correo, c.fecha_creacion;
 
COMMENT ON VIEW ventas.v_carrito_activo IS
    'Resumen de todos los carritos activos: comprador, items, total y días abierto.';
 
 
-- VIEW 3 ─ Historial de ventas completo
CREATE OR REPLACE VIEW facturacion.v_historial_ventas AS
SELECT
    f.id_factura,
    f.numero_factura,
    f.fecha_factura,
    f.metodo_pago,
    f.estado_factura,
    uc.primer_nombre || ' ' || uc.primer_apellido AS comprador,
    uc.correo                                      AS correo_comprador,
    p.titulo                                       AS prenda,
    cat.nombre                                     AS categoria,
    m.nombre                                       AS marca,
    uv.primer_nombre || ' ' || uv.primer_apellido  AS vendedor,
    fd.precio_unitario,
    f.total
FROM facturacion.facturas            f
JOIN facturacion.factura_detalle    fd  ON fd.id_factura    = f.id_factura
JOIN catalogo.prendas                p  ON p.id_prenda      = fd.id_prenda
JOIN catalogo.categorias           cat  ON cat.id_categoria = p.id_categoria
JOIN catalogo.marcas                 m  ON m.id_marca       = p.id_marca
JOIN seguridad.usuarios             uv  ON uv.id_usuario    = p.id_usuario
JOIN ventas.carritos                 c  ON c.id_carrito     = f.id_carrito
JOIN seguridad.usuarios             uc  ON uc.id_usuario    = c.id_comprador;
 
COMMENT ON VIEW facturacion.v_historial_ventas IS
    'Vista completa de ventas: comprador, vendedor, prenda, categoría, precio y factura.';
 
 
-- VIEW 4 ─ Dashboard de vendedores (rendimiento)
CREATE OR REPLACE VIEW seguridad.v_dashboard_vendedores AS
SELECT
    u.id_usuario,
    u.primer_nombre || ' ' || u.primer_apellido   AS vendedor,
    u.correo,
    COUNT(p.id_prenda)                             AS total_publicadas,
    COUNT(p.id_prenda) FILTER (WHERE p.estado_publicacion = 'DISPONIBLE')  AS disponibles,
    COUNT(p.id_prenda) FILTER (WHERE p.estado_publicacion = 'VENDIDA')     AS vendidas,
    COUNT(p.id_prenda) FILTER (WHERE p.estado_publicacion = 'PAUSADA')     AS pausadas,
    COALESCE(SUM(fd.precio_unitario), 0)           AS ingresos_totales,
    ROUND(COALESCE(AVG(fd.precio_unitario), 0), 0) AS precio_promedio_vendido
FROM seguridad.usuarios u
LEFT JOIN catalogo.prendas             p  ON p.id_usuario   = u.id_usuario
LEFT JOIN facturacion.factura_detalle fd  ON fd.id_prenda   = p.id_prenda
LEFT JOIN facturacion.facturas         f  ON f.id_factura   = fd.id_factura
                                         AND f.estado_factura = 'PAGADA'
WHERE u.id_rol = (SELECT id_rol FROM seguridad.roles WHERE nombre = 'VENDEDOR')
GROUP BY u.id_usuario, u.primer_nombre, u.primer_apellido, u.correo;
 
COMMENT ON VIEW seguridad.v_dashboard_vendedores IS
    'Rendimiento de cada vendedor: publicaciones, ventas e ingresos generados.';
 
 
-- VIEW 5 ─ KPIs generales de la plataforma
CREATE OR REPLACE VIEW facturacion.v_kpis_plataforma AS
SELECT
    (SELECT COUNT(*) FROM seguridad.usuarios WHERE activo = TRUE)           AS usuarios_activos,
    (SELECT COUNT(*) FROM catalogo.prendas WHERE estado_publicacion = 'DISPONIBLE') AS prendas_disponibles,
    (SELECT COUNT(*) FROM catalogo.prendas WHERE estado_publicacion = 'VENDIDA')    AS prendas_vendidas,
    (SELECT COUNT(*) FROM ventas.carritos WHERE estado = 'ACTIVO')          AS carritos_activos,
    (SELECT COUNT(*) FROM facturacion.facturas WHERE estado_factura = 'PAGADA')     AS facturas_pagadas,
    (SELECT COALESCE(SUM(total), 0) FROM facturacion.facturas WHERE estado_factura = 'PAGADA') AS ingresos_totales,
    (SELECT ROUND(AVG(total)::numeric, 0) FROM facturacion.facturas WHERE estado_factura = 'PAGADA') AS ticket_promedio,
    (SELECT ROUND(
        COUNT(*) FILTER (WHERE estado = 'COMPRADO') * 100.0
        / NULLIF(COUNT(*), 0), 2
    ) FROM ventas.carritos)                                                  AS tasa_conversion_pct;
 
COMMENT ON VIEW facturacion.v_kpis_plataforma IS
    'Vista de KPIs globales: usuarios, inventario, ventas, ingresos y conversión.';
 
 
-- VIEW 6 ─ Prendas con todas sus imágenes
CREATE OR REPLACE VIEW catalogo.v_prendas_imagenes AS
SELECT
    p.id_prenda,
    p.titulo,
    p.precio,
    p.estado_publicacion,
    i.id_imagen,
    i.url_imagen,
    i.es_principal,
    i.orden
FROM catalogo.prendas p
JOIN catalogo.imagenes_prendas i ON i.id_prenda = p.id_prenda
ORDER BY p.id_prenda, i.orden;
 
COMMENT ON VIEW catalogo.v_prendas_imagenes IS
    'Lista de prendas con todas sus imágenes asociadas ordenadas.';