-- ════════════════════════════════════════════════════════════
--  1. CONSULTAS SIMPLES
-- ════════════════════════════════════════════════════════════
 
-- 1.1 Listar todos los usuarios registrados con su rol
SELECT
    u.id_usuario,
    u.primer_nombre || ' ' || u.primer_apellido AS nombre_completo,
    u.correo,
    u.telefono,
    r.nombre AS rol,
    u.fecha_registro,
    u.activo
FROM seguridad.usuarios u
JOIN seguridad.roles r ON r.id_rol = u.id_rol
ORDER BY u.fecha_registro DESC;
 
 
-- 1.2 Listar todas las prendas disponibles en el catálogo
SELECT
    p.id_prenda,
    p.titulo,
    p.talla,
    p.color,
    p.precio,
    p.genero,
    p.condicion,
    p.estado_publicacion,
    p.fecha_publicacion
FROM catalogo.prendas p
WHERE p.estado_publicacion = 'DISPONIBLE'
ORDER BY p.fecha_publicacion DESC;
 
 
-- 1.3 Listar prendas filtradas por condición (NUEVO / USADO)
SELECT
    titulo, talla, color, precio, genero, condicion
FROM catalogo.prendas
WHERE condicion = 'NUEVO'
  AND estado_publicacion = 'DISPONIBLE'
ORDER BY precio ASC;
 
 
-- 1.4 Listar prendas por categoría específica
SELECT
    p.titulo, p.talla, p.color, p.precio, p.condicion
FROM catalogo.prendas p
JOIN catalogo.categorias c ON c.id_categoria = p.id_categoria
WHERE c.nombre = 'Chaquetas'
  AND p.estado_publicacion = 'DISPONIBLE'
ORDER BY p.precio DESC;
 
 
-- 1.5 Listar prendas dentro de un rango de precios
SELECT
    titulo, talla, precio, genero, condicion
FROM catalogo.prendas
WHERE precio BETWEEN 20000 AND 80000
  AND estado_publicacion = 'DISPONIBLE'
ORDER BY precio ASC;
 
 
-- 1.6 Listar prendas por género
SELECT
    titulo, talla, color, precio, condicion
FROM catalogo.prendas
WHERE genero = 'Mujer'
  AND estado_publicacion = 'DISPONIBLE'
ORDER BY fecha_publicacion DESC;
 
 
-- 1.7 Ver todos los carritos activos
SELECT
    c.id_carrito,
    u.primer_nombre || ' ' || u.primer_apellido AS comprador,
    u.correo,
    c.estado,
    c.fecha_creacion
FROM ventas.carritos c
JOIN seguridad.usuarios u ON u.id_usuario = c.id_comprador
WHERE c.estado = 'ACTIVO'
ORDER BY c.fecha_creacion DESC;
 
 
-- 1.8 Ver todas las facturas con su estado y método de pago
SELECT
    f.numero_factura,
    f.subtotal,
    f.total,
    f.metodo_pago,
    f.estado_factura,
    f.fecha_factura
FROM facturacion.facturas f
ORDER BY f.fecha_factura DESC;
 
 
-- 1.9 Listar todas las marcas disponibles
SELECT id_marca, nombre
FROM catalogo.marcas
ORDER BY nombre ASC;
 
 
-- 1.10 Listar todas las categorías con descripción
SELECT id_categoria, nombre, descripcion
FROM catalogo.categorias
ORDER BY nombre ASC;
 
 
-- 1.11 Ver prendas publicadas por un vendedor específico
SELECT
    titulo, talla, precio, condicion, estado_publicacion, fecha_publicacion
FROM catalogo.prendas
WHERE id_usuario = (
    SELECT id_usuario FROM seguridad.usuarios WHERE correo = 'camilo.gonzalez@gmail.com'
)
ORDER BY fecha_publicacion DESC;
 
 
-- 1.12 Contar cuántas prendas hay por estado de publicación
SELECT
    estado_publicacion,
    COUNT(*) AS total_prendas
FROM catalogo.prendas
GROUP BY estado_publicacion
ORDER BY total_prendas DESC;
 
 
-- 1.13 Ver imagen principal de cada prenda disponible
SELECT
    p.titulo,
    p.precio,
    i.url_imagen
FROM catalogo.prendas p
JOIN catalogo.imagenes_prendas i ON i.id_prenda = p.id_prenda
WHERE i.es_principal = TRUE
  AND p.estado_publicacion = 'DISPONIBLE'
ORDER BY p.fecha_publicacion DESC;
 
 
-- 1.14 Listar facturas anuladas
SELECT
    f.numero_factura,
    f.total,
    f.fecha_factura,
    f.metodo_pago
FROM facturacion.facturas f
WHERE f.estado_factura = 'ANULADA'
ORDER BY f.fecha_factura DESC;
 
 
-- 1.15 Ver el detalle de un carrito activo por correo del comprador
SELECT
    cd.id_prenda,
    p.titulo,
    p.talla,
    cd.precio,
    cd.fecha_agregado
FROM ventas.carrito_detalle cd
JOIN ventas.carritos c ON c.id_carrito = cd.id_carrito
JOIN seguridad.usuarios u ON u.id_usuario = c.id_comprador
JOIN catalogo.prendas p ON p.id_prenda = cd.id_prenda
WHERE u.correo = 'manuela.moreno@gmail.com'
  AND c.estado = 'ACTIVO';