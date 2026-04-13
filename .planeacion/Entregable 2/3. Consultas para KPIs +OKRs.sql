-- ════════════════════════════════════════════════════════════
--  2.1 CONSULTAS PARA KPIs + OKRs
-- ════════════════════════════════════════════════════════════
 
-- KPI 1 ─ Total de ingresos por mes (solo facturas PAGADAS)
SELECT
    TO_CHAR(f.fecha_factura, 'YYYY-MM')  AS mes,
    COUNT(f.id_factura)                  AS total_facturas,
    SUM(f.total)                         AS ingresos_totales,
    AVG(f.total)                         AS ticket_promedio,
    MIN(f.total)                         AS venta_minima,
    MAX(f.total)                         AS venta_maxima
FROM facturacion.facturas f
WHERE f.estado_factura = 'PAGADA'
GROUP BY TO_CHAR(f.fecha_factura, 'YYYY-MM')
ORDER BY mes DESC;
 
 
-- KPI 2 ─ Tasa de conversión de carritos (COMPRADO / total carritos)
SELECT
    COUNT(*)                                                        AS total_carritos,
    COUNT(*) FILTER (WHERE estado = 'COMPRADO')                    AS comprados,
    COUNT(*) FILTER (WHERE estado = 'CANCELADO')                   AS cancelados,
    COUNT(*) FILTER (WHERE estado = 'ACTIVO')                      AS activos,
    ROUND(
        COUNT(*) FILTER (WHERE estado = 'COMPRADO') * 100.0
        / NULLIF(COUNT(*), 0), 2
    )                                                               AS tasa_conversion_pct
FROM ventas.carritos;
 
 
-- KPI 3 ─ Prendas disponibles vs vendidas (inventario general)
SELECT
    estado_publicacion,
    COUNT(*)                                    AS cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS porcentaje
FROM catalogo.prendas
GROUP BY estado_publicacion
ORDER BY cantidad DESC;
 
 
-- KPI 4 ─ Ingreso total por método de pago
SELECT
    metodo_pago,
    COUNT(*)         AS total_transacciones,
    SUM(total)       AS ingresos,
    AVG(total)       AS promedio_por_transaccion
FROM facturacion.facturas
WHERE estado_factura = 'PAGADA'
GROUP BY metodo_pago
ORDER BY ingresos DESC;
 
 
-- KPI 5 ─ Categorías más vendidas (por unidades vendidas)
SELECT
    cat.nombre                    AS categoria,
    COUNT(fd.id_prenda)           AS unidades_vendidas,
    SUM(fd.precio_unitario)       AS ingresos_categoria
FROM facturacion.factura_detalle  fd
JOIN facturacion.facturas          f  ON f.id_factura    = fd.id_factura
JOIN catalogo.prendas              p  ON p.id_prenda     = fd.id_prenda
JOIN catalogo.categorias         cat  ON cat.id_categoria = p.id_categoria
WHERE f.estado_factura = 'PAGADA'
GROUP BY cat.nombre
ORDER BY unidades_vendidas DESC;
 
 
-- KPI 6 ─ Marcas más vendidas
SELECT
    m.nombre                      AS marca,
    COUNT(fd.id_prenda)           AS unidades_vendidas,
    SUM(fd.precio_unitario)       AS ingresos_marca
FROM facturacion.factura_detalle  fd
JOIN facturacion.facturas          f ON f.id_factura  = fd.id_factura
JOIN catalogo.prendas              p ON p.id_prenda   = fd.id_prenda
JOIN catalogo.marcas               m ON m.id_marca    = p.id_marca
WHERE f.estado_factura = 'PAGADA'
GROUP BY m.nombre
ORDER BY unidades_vendidas DESC;
 
 
-- KPI 7 ─ Top 5 vendedores por ingresos generados
SELECT
    uv.primer_nombre || ' ' || uv.primer_apellido  AS vendedor,
    uv.correo,
    COUNT(fd.id_prenda)                            AS prendas_vendidas,
    SUM(fd.precio_unitario)                        AS ingresos_generados
FROM facturacion.factura_detalle  fd
JOIN facturacion.facturas          f  ON f.id_factura  = fd.id_factura
JOIN catalogo.prendas              p  ON p.id_prenda   = fd.id_prenda
JOIN seguridad.usuarios           uv  ON uv.id_usuario = p.id_usuario
WHERE f.estado_factura = 'PAGADA'
GROUP BY uv.id_usuario, uv.primer_nombre, uv.primer_apellido, uv.correo
ORDER BY ingresos_generados DESC
LIMIT 5;
 
 
-- KPI 8 ─ Top 5 compradores por gasto total
SELECT
    uc.primer_nombre || ' ' || uc.primer_apellido  AS comprador,
    uc.correo,
    COUNT(f.id_factura)                            AS total_compras,
    SUM(f.total)                                   AS gasto_total,
    AVG(f.total)                                   AS ticket_promedio
FROM facturacion.facturas           f
JOIN ventas.carritos                c  ON c.id_carrito   = f.id_carrito
JOIN seguridad.usuarios            uc  ON uc.id_usuario  = c.id_comprador
WHERE f.estado_factura = 'PAGADA'
GROUP BY uc.id_usuario, uc.primer_nombre, uc.primer_apellido, uc.correo
ORDER BY gasto_total DESC
LIMIT 5;
 
 
-- KPI 9 ─ Tiempo promedio entre publicación y venta de una prenda (días)
SELECT
    cat.nombre                                               AS categoria,
    ROUND(AVG(
        EXTRACT(EPOCH FROM (f.fecha_factura - p.fecha_publicacion)) / 86400
    )::numeric, 1)                                           AS dias_promedio_en_vender,
    COUNT(fd.id_prenda)                                      AS muestras
FROM facturacion.factura_detalle  fd
JOIN facturacion.facturas          f  ON f.id_factura    = fd.id_factura
JOIN catalogo.prendas              p  ON p.id_prenda     = fd.id_prenda
JOIN catalogo.categorias         cat  ON cat.id_categoria = p.id_categoria
WHERE f.estado_factura = 'PAGADA'
GROUP BY cat.nombre
ORDER BY dias_promedio_en_vender ASC;
 
 
-- KPI 10 ─ Nuevos usuarios registrados por mes
SELECT
    TO_CHAR(fecha_registro, 'YYYY-MM')  AS mes,
    COUNT(*)                            AS nuevos_usuarios,
    COUNT(*) FILTER (WHERE id_rol = (SELECT id_rol FROM seguridad.roles WHERE nombre = 'VENDEDOR')) AS nuevos_vendedores,
    COUNT(*) FILTER (WHERE id_rol = (SELECT id_rol FROM seguridad.roles WHERE nombre = 'COMPRADOR')) AS nuevos_compradores
FROM seguridad.usuarios
GROUP BY TO_CHAR(fecha_registro, 'YYYY-MM')
ORDER BY mes DESC;
 
 
-- OKR 1 ─ Objetivo: aumentar prendas disponibles
--          KR: cuántas prendas se publicaron en los últimos 30 días
SELECT
    COUNT(*)                       AS prendas_publicadas_30_dias,
    ROUND(AVG(precio), 0)          AS precio_promedio,
    COUNT(*) FILTER (WHERE condicion = 'NUEVO')  AS nuevas,
    COUNT(*) FILTER (WHERE condicion = 'USADO')  AS usadas
FROM catalogo.prendas
WHERE fecha_publicacion >= NOW() - INTERVAL '30 days'
  AND estado_publicacion = 'DISPONIBLE';
 
 
-- OKR 2 ─ Objetivo: reducir tasa de carritos abandonados
--          KR: carritos activos con más de 3 días sin completarse
SELECT
    COUNT(*)                                         AS carritos_abandonados,
    ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - c.fecha_creacion)) / 86400)::numeric, 1)
                                                     AS dias_promedio_abandonados
FROM ventas.carritos c
WHERE c.estado = 'ACTIVO'
  AND c.fecha_creacion < NOW() - INTERVAL '3 days';
 
 
-- OKR 3 ─ Objetivo: diversificar categorías publicadas
--          KR: distribución de prendas disponibles por categoría
SELECT
    cat.nombre                                  AS categoria,
    COUNT(p.id_prenda)                          AS total_disponibles,
    ROUND(COUNT(p.id_prenda) * 100.0
          / SUM(COUNT(p.id_prenda)) OVER (), 2) AS porcentaje_catalogo
FROM catalogo.prendas p
JOIN catalogo.categorias cat ON cat.id_categoria = p.id_categoria
WHERE p.estado_publicacion = 'DISPONIBLE'
GROUP BY cat.nombre
ORDER BY total_disponibles DESC;
 
 
-- OKR 4 ─ Objetivo: crecer ingresos mes a mes
--          KR: comparativo de ingresos mes actual vs mes anterior
SELECT
    TO_CHAR(fecha_factura, 'YYYY-MM')    AS mes,
    SUM(total)                           AS ingresos,
    LAG(SUM(total)) OVER (ORDER BY TO_CHAR(fecha_factura, 'YYYY-MM')) AS ingresos_mes_anterior,
    ROUND(
        (SUM(total) - LAG(SUM(total)) OVER (ORDER BY TO_CHAR(fecha_factura, 'YYYY-MM')))
        * 100.0
        / NULLIF(LAG(SUM(total)) OVER (ORDER BY TO_CHAR(fecha_factura, 'YYYY-MM')), 0)
    , 2)                                 AS variacion_pct
FROM facturacion.facturas
WHERE estado_factura = 'PAGADA'
GROUP BY TO_CHAR(fecha_factura, 'YYYY-MM')
ORDER BY mes;
 
 
-- OKR 5 ─ Objetivo: mejorar retención de compradores
--          KR: compradores que repitieron compra vs compradores únicos
SELECT
    COUNT(DISTINCT uc.id_usuario)                                      AS total_compradores,
    COUNT(DISTINCT uc.id_usuario) FILTER (WHERE compras_por_usuario > 1) AS compradores_recurrentes,
    COUNT(DISTINCT uc.id_usuario) FILTER (WHERE compras_por_usuario = 1) AS compradores_unicos,
    ROUND(
        COUNT(DISTINCT uc.id_usuario) FILTER (WHERE compras_por_usuario > 1)
        * 100.0 / NULLIF(COUNT(DISTINCT uc.id_usuario), 0)
    , 2)                                                                AS tasa_retencion_pct
FROM (
    SELECT c.id_comprador, COUNT(f.id_factura) AS compras_por_usuario
    FROM ventas.carritos c
    JOIN facturacion.facturas f ON f.id_carrito = c.id_carrito
    WHERE f.estado_factura = 'PAGADA'
    GROUP BY c.id_comprador
) sub
JOIN seguridad.usuarios uc ON uc.id_usuario = sub.id_comprador;
 