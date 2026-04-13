-- 3. Script Indices NonClustered
-- Optimización de rendimiento para filtros y búsquedas frecuentes

CREATE INDEX idx_prendas_categoria      ON catalogo.prendas(id_categoria);
CREATE INDEX idx_prendas_usuario        ON catalogo.prendas(id_usuario);
CREATE INDEX idx_prendas_estado         ON catalogo.prendas(estado_publicacion);
CREATE INDEX idx_prendas_condicion      ON catalogo.prendas(condicion);
CREATE INDEX idx_prendas_precio         ON catalogo.prendas(precio);
CREATE INDEX idx_prendas_genero         ON catalogo.prendas(genero);

CREATE INDEX idx_imagenes_prenda        ON catalogo.imagenes_prendas(id_prenda);

CREATE INDEX idx_carrito_comprador      ON ventas.carritos(id_comprador);
CREATE INDEX idx_carrito_estado         ON ventas.carritos(estado);