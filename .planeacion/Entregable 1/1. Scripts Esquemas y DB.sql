-- 1. Script Esquemas & DB
-- Creación de la estructura base y tablas

-- SCHEMAS
CREATE SCHEMA IF NOT EXISTS catalogo;
CREATE SCHEMA IF NOT EXISTS facturacion;
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS ventas;

-- SCHEMA: seguridad
CREATE TABLE seguridad.roles (
    id_rol       SERIAL       PRIMARY KEY,
    nombre       VARCHAR(30)  NOT NULL UNIQUE
);

INSERT INTO seguridad.roles (nombre) VALUES ('ADMIN'), ('VENDEDOR'), ('COMPRADOR');

CREATE TABLE seguridad.usuarios (
    id_usuario       SERIAL        PRIMARY KEY,
    id_rol           INT           NOT NULL REFERENCES seguridad.roles(id_rol),
    primer_nombre    VARCHAR(30)   NOT NULL,
    segundo_nombre   VARCHAR(30),
    primer_apellido  VARCHAR(30)   NOT NULL,
    segundo_apellido VARCHAR(30),
    correo           VARCHAR(100)  NOT NULL UNIQUE,
    telefono         CHAR(10),
    contrasena       VARCHAR(255)  NOT NULL,
    fecha_registro   TIMESTAMP     NOT NULL DEFAULT NOW(),
    activo           BOOLEAN       NOT NULL DEFAULT TRUE,
    genero           VARCHAR(20),
    fecha_nacimiento DATE
);

-- SCHEMA: catalogo
CREATE TABLE catalogo.categorias (
    id_categoria  SERIAL       PRIMARY KEY,
    nombre        VARCHAR(50)  NOT NULL UNIQUE,
    descripcion   VARCHAR(200)
);

INSERT INTO catalogo.categorias (nombre) VALUES
    ('Camisetas'), ('Pantalones'), ('Vestidos'), ('Chaquetas'),
    ('Zapatos'), ('Accesorios'), ('Ropa Interior'), ('Deportiva'), ('Abrigos'), ('Faldas');

CREATE TABLE catalogo.marcas (
    id_marca   SERIAL      PRIMARY KEY,
    nombre     VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE catalogo.prendas (
    id_prenda          SERIAL          PRIMARY KEY,
    id_usuario         INT             NOT NULL REFERENCES seguridad.usuarios(id_usuario),
    id_categoria       INT             REFERENCES catalogo.categorias(id_categoria),
    id_marca           INT             REFERENCES catalogo.marcas(id_marca),
    titulo             VARCHAR(100)    NOT NULL,
    descripcion        VARCHAR(400)    NOT NULL,
    talla              VARCHAR(10)     NOT NULL,
    color              VARCHAR(20),
    precio             DECIMAL(10,2)   NOT NULL,
    genero             VARCHAR(10),
    condicion          VARCHAR(10)     NOT NULL DEFAULT 'USADO',
    estado_publicacion VARCHAR(20)     NOT NULL DEFAULT 'DISPONIBLE',
    fecha_publicacion  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE catalogo.imagenes_prendas (
    id_imagen    SERIAL        PRIMARY KEY,
    id_prenda    INT           NOT NULL REFERENCES catalogo.prendas(id_prenda) ON DELETE CASCADE,
    url_imagen   VARCHAR(500)  NOT NULL,
    es_principal BOOLEAN       NOT NULL DEFAULT FALSE,
    orden        SMALLINT      NOT NULL DEFAULT 0
);

-- SCHEMA: ventas
CREATE TABLE ventas.carritos (
    id_carrito     SERIAL       PRIMARY KEY,
    id_comprador   INT          NOT NULL REFERENCES seguridad.usuarios(id_usuario),
    estado         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE ventas.carrito_detalle (
    id_carrito     INT           NOT NULL REFERENCES ventas.carritos(id_carrito),
    id_prenda      INT           NOT NULL REFERENCES catalogo.prendas(id_prenda),
    precio         DECIMAL(10,2) NOT NULL,
    fecha_agregado TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_carrito_prendas   PRIMARY KEY (id_carrito, id_prenda),
    CONSTRAINT uq_prenda_en_carrito UNIQUE (id_prenda)
);

-- SCHEMA: facturacion
CREATE TABLE facturacion.facturas (
    id_factura      SERIAL          PRIMARY KEY,
    id_carrito      INT             NOT NULL REFERENCES ventas.carritos(id_carrito),
    numero_factura  VARCHAR(20)     NOT NULL UNIQUE,
    subtotal        DECIMAL(10,2)   NOT NULL,
    total           DECIMAL(10,2)   NOT NULL,
    fecha_factura   TIMESTAMP       NOT NULL DEFAULT NOW(),
    metodo_pago     VARCHAR(20)     NOT NULL,
    estado_factura  VARCHAR(20)     NOT NULL DEFAULT 'PAGADA'
);

CREATE TABLE facturacion.factura_detalle (
    id_factura      INT           NOT NULL REFERENCES facturacion.facturas(id_factura),
    id_prenda       INT           NOT NULL REFERENCES catalogo.prendas(id_prenda),
    precio_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT pk_factura_detalle PRIMARY KEY (id_factura, id_prenda)
);