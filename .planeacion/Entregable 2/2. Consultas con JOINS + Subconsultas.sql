-- ════════════════════════════════════════════════════════════
--  2. CONSULTAS CON JOINs + SUBCONSULTAS
-- ════════════════════════════════════════════════════════════
 
-- 2.1 Catálogo completo: prenda + categoría + marca + vendedor + imagen principal
SELECT
    p.id_prenda,
    p.titulo,
    cat.nombre                                    AS categoria,
    m.nombre                                      AS marca,
    p.talla,
    p.color,
    p.precio,
    p.genero,
    p.condicion,
    u.primer_nombre || ' ' || u.primer_apellido   AS vendedor,
    i.url_imagen                                  AS imagen_principal
FROM catalogo.prendas p
JOIN catalogo.categorias      cat ON cat.id_categoria = p.id_categoria
JOIN catalogo.marcas            m ON m.id_marca       = p.id_marca
JOIN seguridad.usuarios         u ON u.id_usuario     = p.id_usuario
LEFT JOIN catalogo.imagenes_prendas i
       ON i.id_prenda = p.id_prenda AND i.es_principal = TRUE
WHERE p.estado_publicacion = 'DISPONIBLE'
ORDER BY p.fecha_publicacion DESC;
 
 
-- 2.2 Historial de compras de un usuario (facturas + prendas compradas)
SELECT
    f.numero_factura,
    f.fecha_factura,
    f.metodo_pago,
    f.estado_factura,
    p.titulo                                      AS prenda,
    fd.precio_unitario,
    cat.nombre                                    AS categoria,
    f.total
FROM facturacion.facturas f
JOIN ventas.carritos          c  ON c.id_carrito    = f.id_carrito
JOIN seguridad.usuarios       u  ON u.id_usuario    = c.id_comprador
JOIN facturacion.factura_detalle fd ON fd.id_factura = f.id_factura
JOIN catalogo.prendas         p  ON p.id_prenda     = fd.id_prenda
JOIN catalogo.categorias    cat  ON cat.id_categoria = p.id_categoria
WHERE u.correo = 'manuela.moreno@gmail.com'
ORDER BY f.fecha_factura DESC;
 
 
-- 2.3 Prendas que NUNCA han sido agregadas a ningún carrito
SELECT
    p.id_prenda,
    p.titulo,
    p.precio,
    p.fecha_publicacion,
    u.primer_nombre || ' ' || u.primer_apellido AS vendedor
FROM catalogo.prendas p
JOIN seguridad.usuarios u ON u.id_usuario = p.id_usuario
WHERE p.estado_publicacion = 'DISPONIBLE'
  AND p.id_prenda NOT IN (
      SELECT id_prenda FROM ventas.carrito_detalle
  )
ORDER BY p.fecha_publicacion ASC;
 
 
-- 2.4 Vendedores con sus prendas y cantidad publicada por categoría
SELECT
    u.primer_nombre || ' ' || u.primer_apellido  AS vendedor,
    u.correo,
    cat.nombre                                   AS categoria,
    COUNT(p.id_prenda)                           AS total_publicadas,
    SUM(p.precio)                                AS valor_total_inventario
FROM seguridad.usuarios u
JOIN catalogo.prendas     p   ON p.id_usuario    = u.id_usuario
JOIN catalogo.categorias cat  ON cat.id_categoria = p.id_categoria
WHERE u.id_rol = (SELECT id_rol FROM seguridad.roles WHERE nombre = 'VENDEDOR')
  AND p.estado_publicacion = 'DISPONIBLE'
GROUP BY u.id_usuario, u.primer_nombre, u.primer_apellido, u.correo, cat.nombre
ORDER BY vendedor, total_publicadas DESC;
 
 
-- 2.5 Carritos activos con el total acumulado de cada uno
SELECT
    c.id_carrito,
    u.primer_nombre || ' ' || u.primer_apellido  AS comprador,
    u.correo,
    COUNT(cd.id_prenda)                          AS items_en_carrito,
    SUM(cd.precio)                               AS total_carrito,
    c.fecha_creacion
FROM ventas.carritos c
JOIN seguridad.usuarios       u  ON u.id_usuario = c.id_comprador
JOIN ventas.carrito_detalle  cd  ON cd.id_carrito = c.id_carrito
WHERE c.estado = 'ACTIVO'
GROUP BY c.id_carrito, u.primer_nombre, u.primer_apellido, u.correo, c.fecha_creacion
ORDER BY total_carrito DESC;
 
 
-- 2.6 Prendas más caras que el promedio general del catálogo
SELECT
    p.titulo,
    p.precio,
    cat.nombre AS categoria,
    m.nombre   AS marca,
    p.condicion
FROM catalogo.prendas p
JOIN catalogo.categorias cat ON cat.id_categoria = p.id_categoria
JOIN catalogo.marcas      m  ON m.id_marca       = p.id_marca
WHERE p.estado_publicacion = 'DISPONIBLE'
  AND p.precio > (
      SELECT AVG(precio)
      FROM catalogo.prendas
      WHERE estado_publicacion = 'DISPONIBLE'
  )
ORDER BY p.precio DESC;
 
 
-- 2.7 Compradores que han realizado más de una compra
SELECT
    u.primer_nombre || ' ' || u.primer_apellido  AS comprador,
    u.correo,
    COUNT(f.id_factura)                          AS total_compras,
    SUM(f.total)                                 AS gasto_total
FROM seguridad.usuarios u
JOIN ventas.carritos        c ON c.id_comprador = u.id_usuario
JOIN facturacion.facturas   f ON f.id_carrito   = c.id_carrito
WHERE f.estado_factura = 'PAGADA'
GROUP BY u.id_usuario, u.primer_nombre, u.primer_apellido, u.correo
HAVING COUNT(f.id_factura) > 1
ORDER BY total_compras DESC;
 
 
-- 2.8 Prendas vendidas con datos completos del comprador y vendedor
SELECT
    p.titulo                                      AS prenda,
    p.precio,
    cat.nombre                                    AS categoria,
    uv.primer_nombre || ' ' || uv.primer_apellido AS vendedor,
    uc.primer_nombre || ' ' || uc.primer_apellido AS comprador,
    f.fecha_factura                               AS fecha_venta,
    f.metodo_pago
FROM catalogo.prendas           p
JOIN catalogo.categorias       cat ON cat.id_categoria = p.id_categoria
JOIN seguridad.usuarios         uv ON uv.id_usuario    = p.id_usuario
JOIN facturacion.factura_detalle fd ON fd.id_prenda    = p.id_prenda
JOIN facturacion.facturas        f  ON f.id_factura    = fd.id_factura
JOIN ventas.carritos             c  ON c.id_carrito    = f.id_carrito
JOIN seguridad.usuarios         uc  ON uc.id_usuario   = c.id_comprador
WHERE f.estado_factura = 'PAGADA'
ORDER BY f.fecha_factura DESC;
 
 
-- 2.9 Usuarios que tienen prendas en carrito activo pero nunca han comprado
SELECT DISTINCT
    u.primer_nombre || ' ' || u.primer_apellido  AS usuario,
    u.correo
FROM seguridad.usuarios u
JOIN ventas.carritos c ON c.id_comprador = u.id_usuario AND c.estado = 'ACTIVO'
WHERE u.id_usuario NOT IN (
    SELECT DISTINCT c2.id_comprador
    FROM ventas.carritos c2
    WHERE c2.estado = 'COMPRADO'
);
 
 
-- 2.10 Top 5 prendas con precio más alto por categoría
SELECT
    categoria,
    titulo,
    precio,
    marca,
    condicion
FROM (
    SELECT
        cat.nombre                               AS categoria,
        p.titulo,
        p.precio,
        m.nombre                                 AS marca,
        p.condicion,
        RANK() OVER (PARTITION BY cat.nombre ORDER BY p.precio DESC) AS ranking
    FROM catalogo.prendas p
    JOIN catalogo.categorias cat ON cat.id_categoria = p.id_categoria
    JOIN catalogo.marcas      m  ON m.id_marca       = p.id_marca
    WHERE p.estado_publicacion = 'DISPONIBLE'
) ranked
WHERE ranking <= 5
ORDER BY categoria, ranking;
 
 
-- 2.11 Factura con su detalle completo (una factura específica)
SELECT
    f.numero_factura,
    f.fecha_factura,
    f.metodo_pago,
    f.estado_factura,
    uc.primer_nombre || ' ' || uc.primer_apellido AS comprador,
    p.titulo                                      AS prenda,
    cat.nombre                                    AS categoria,
    uv.primer_nombre || ' ' || uv.primer_apellido AS vendedor,
    fd.precio_unitario,
    f.subtotal,
    f.total
FROM facturacion.facturas          f
JOIN facturacion.factura_detalle  fd  ON fd.id_factura    = f.id_factura
JOIN catalogo.prendas              p  ON p.id_prenda      = fd.id_prenda
JOIN catalogo.categorias         cat  ON cat.id_categoria = p.id_categoria
JOIN seguridad.usuarios           uv  ON uv.id_usuario    = p.id_usuario
JOIN ventas.carritos               c  ON c.id_carrito     = f.id_carrito
JOIN seguridad.usuarios           uc  ON uc.id_usuario    = c.id_comprador
WHERE f.numero_factura = 'FAC-2025-0001';