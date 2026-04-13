-- 2. Script Restricciones (Campo)
-- Validaciones de datos y reglas de negocio

-- Restricciones de Usuario
ALTER TABLE seguridad.usuarios
    ADD CONSTRAINT ck_nombres     CHECK (primer_nombre   ~ '^[A-Za-záéíóúÁÉÍÓÚñÑ]{3,30}$'),
    ADD CONSTRAINT ck_apellidos   CHECK (primer_apellido ~ '^[A-Za-záéíóúÁÉÍÓÚñÑ]{3,30}$'),
    ADD CONSTRAINT ck_correo      CHECK (correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    ADD CONSTRAINT ck_telefono    CHECK (telefono ~ '^\d{10}$'),
    ADD CONSTRAINT ck_contrasena  CHECK (LENGTH(contrasena) >= 60),
    ADD CONSTRAINT ck_genero      CHECK (genero IN ('Hombre', 'Mujer', 'Prefiero no decirlo')),
    ADD CONSTRAINT ck_fecha_nacimiento CHECK (
        fecha_nacimiento <= CURRENT_DATE 
        AND fecha_nacimiento >= CURRENT_DATE - INTERVAL '120 years'
    );

-- Restricciones de Prendas
ALTER TABLE catalogo.prendas
    ADD CONSTRAINT ck_titulo      CHECK (LENGTH(titulo) BETWEEN 3 AND 100 AND titulo ~ '^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ .+:\-]+$'),
    ADD CONSTRAINT ck_descripcion CHECK (LENGTH(descripcion) BETWEEN 5 AND 400),
    ADD CONSTRAINT ck_precio      CHECK (precio >= 1000),
    ADD CONSTRAINT ck_prenda_estado CHECK (estado_publicacion IN ('DISPONIBLE', 'VENDIDA', 'PAUSADA')),
    ADD CONSTRAINT ck_prenda_genero CHECK (genero IN ('Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña')),
    ADD CONSTRAINT ck_condicion    CHECK (condicion IN ('NUEVO', 'USADO'));

-- Restricciones de Ventas y Facturación
ALTER TABLE ventas.carritos
    ADD CONSTRAINT ck_carrito_estado CHECK (estado IN ('ACTIVO', 'COMPRADO', 'CANCELADO'));

ALTER TABLE ventas.carrito_detalle
    ADD CONSTRAINT ck_cp_precio CHECK (precio >= 0);

ALTER TABLE facturacion.facturas
    ADD CONSTRAINT ck_subtotal CHECK (subtotal >= 0),
    ADD CONSTRAINT ck_total CHECK (total >= 0),
    ADD CONSTRAINT ck_metodo_pago CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
    ADD CONSTRAINT ck_estado_factura CHECK (estado_factura IN ('PAGADA', 'ANULADA'));

ALTER TABLE facturacion.factura_detalle
    ADD CONSTRAINT ck_precio_unitario CHECK (precio_unitario >= 0);