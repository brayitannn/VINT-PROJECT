| esquema     | tabla                    | posicion | columna                 | tipo_dato                   | permite_nulo | valor_por_defecto                                                    |
| ----------- | ------------------------ | -------- | ----------------------- | --------------------------- | ------------ | -------------------------------------------------------------------- |
| catalogo    | auditoria_precios        | 1        | id_auditoria            | integer                     | NO           | nextval('catalogo.auditoria_precios_id_auditoria_seq'::regclass)     |
| catalogo    | auditoria_precios        | 2        | id_prenda               | integer                     | NO           | null                                                                 |
| catalogo    | auditoria_precios        | 3        | precio_anterior         | numeric                     | YES          | null                                                                 |
| catalogo    | auditoria_precios        | 4        | precio_nuevo            | numeric                     | YES          | null                                                                 |
| catalogo    | auditoria_precios        | 5        | fecha_cambio            | timestamp without time zone | NO           | now()                                                                |
| catalogo    | auditoria_precios        | 6        | usuario_db              | character varying           | NO           | CURRENT_USER                                                         |
| catalogo    | categorias               | 1        | id_categoria            | integer                     | NO           | nextval('catalogo.categorias_id_categoria_seq'::regclass)            |
| catalogo    | categorias               | 2        | nombre                  | character varying           | NO           | null                                                                 |
| catalogo    | categorias               | 3        | descripcion             | character varying           | YES          | null                                                                 |
| catalogo    | imagenes_prendas         | 1        | id_imagen               | integer                     | NO           | nextval('catalogo.imagenes_prendas_id_imagen_seq'::regclass)         |
| catalogo    | imagenes_prendas         | 2        | id_prenda               | integer                     | NO           | null                                                                 |
| catalogo    | imagenes_prendas         | 3        | url_imagen              | character varying           | NO           | null                                                                 |
| catalogo    | imagenes_prendas         | 4        | es_principal            | boolean                     | NO           | false                                                                |
| catalogo    | imagenes_prendas         | 5        | orden                   | smallint                    | NO           | 0                                                                    |
| catalogo    | marcas                   | 1        | id_marca                | integer                     | NO           | nextval('catalogo.marcas_id_marca_seq'::regclass)                    |
| catalogo    | marcas                   | 2        | nombre                  | character varying           | NO           | null                                                                 |
| catalogo    | prendas                  | 1        | id_prenda               | integer                     | NO           | nextval('catalogo.prendas_id_prenda_seq'::regclass)                  |
| catalogo    | prendas                  | 2        | id_usuario              | integer                     | NO           | null                                                                 |
| catalogo    | prendas                  | 3        | id_categoria            | integer                     | YES          | null                                                                 |
| catalogo    | prendas                  | 4        | id_marca                | integer                     | YES          | null                                                                 |
| catalogo    | prendas                  | 5        | titulo                  | character varying           | NO           | null                                                                 |
| catalogo    | prendas                  | 6        | descripcion             | character varying           | NO           | null                                                                 |
| catalogo    | prendas                  | 7        | talla                   | character varying           | NO           | null                                                                 |
| catalogo    | prendas                  | 8        | color                   | character varying           | YES          | null                                                                 |
| catalogo    | prendas                  | 9        | precio                  | numeric                     | NO           | null                                                                 |
| catalogo    | prendas                  | 10       | genero                  | character varying           | YES          | null                                                                 |
| catalogo    | prendas                  | 11       | condicion               | character varying           | NO           | 'USADO'::character varying                                           |
| catalogo    | prendas                  | 12       | estado_publicacion      | character varying           | NO           | 'DISPONIBLE'::character varying                                      |
| catalogo    | prendas                  | 13       | fecha_publicacion       | timestamp without time zone | NO           | now()                                                                |
| catalogo    | v_catalogo_publico       | 1        | id_prenda               | integer                     | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 2        | titulo                  | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 3        | descripcion             | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 4        | categoria               | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 5        | marca                   | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 6        | talla                   | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 7        | color                   | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 8        | precio                  | numeric                     | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 9        | genero                  | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 10       | condicion               | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 11       | fecha_publicacion       | timestamp without time zone | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 12       | vendedor                | text                        | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 13       | correo_vendedor         | character varying           | YES          | null                                                                 |
| catalogo    | v_catalogo_publico       | 14       | imagen_principal        | character varying           | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 1        | id_prenda               | integer                     | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 2        | titulo                  | character varying           | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 3        | precio                  | numeric                     | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 4        | estado_publicacion      | character varying           | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 5        | id_imagen               | integer                     | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 6        | url_imagen              | character varying           | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 7        | es_principal            | boolean                     | YES          | null                                                                 |
| catalogo    | v_prendas_imagenes       | 8        | orden                   | smallint                    | YES          | null                                                                 |
| facturacion | factura_detalle          | 1        | id_factura              | integer                     | NO           | null                                                                 |
| facturacion | factura_detalle          | 2        | id_prenda               | integer                     | NO           | null                                                                 |
| facturacion | factura_detalle          | 3        | precio_unitario         | numeric                     | NO           | null                                                                 |
| facturacion | facturas                 | 1        | id_factura              | integer                     | NO           | nextval('facturacion.facturas_id_factura_seq'::regclass)             |
| facturacion | facturas                 | 2        | id_carrito              | integer                     | NO           | null                                                                 |
| facturacion | facturas                 | 3        | numero_factura          | character varying           | NO           | null                                                                 |
| facturacion | facturas                 | 4        | subtotal                | numeric                     | NO           | null                                                                 |
| facturacion | facturas                 | 5        | total                   | numeric                     | NO           | null                                                                 |
| facturacion | facturas                 | 6        | fecha_factura           | timestamp without time zone | NO           | now()                                                                |
| facturacion | facturas                 | 7        | metodo_pago             | character varying           | NO           | null                                                                 |
| facturacion | facturas                 | 8        | estado_factura          | character varying           | NO           | 'PAGADA'::character varying                                          |
| facturacion | v_historial_ventas       | 1        | id_factura              | integer                     | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 2        | numero_factura          | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 3        | fecha_factura           | timestamp without time zone | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 4        | metodo_pago             | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 5        | estado_factura          | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 6        | comprador               | text                        | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 7        | correo_comprador        | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 8        | prenda                  | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 9        | categoria               | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 10       | marca                   | character varying           | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 11       | vendedor                | text                        | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 12       | precio_unitario         | numeric                     | YES          | null                                                                 |
| facturacion | v_historial_ventas       | 13       | total                   | numeric                     | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 1        | usuarios_activos        | bigint                      | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 2        | prendas_disponibles     | bigint                      | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 3        | prendas_vendidas        | bigint                      | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 4        | carritos_activos        | bigint                      | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 5        | facturas_pagadas        | bigint                      | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 6        | ingresos_totales        | numeric                     | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 7        | ticket_promedio         | numeric                     | YES          | null                                                                 |
| facturacion | v_kpis_plataforma        | 8        | tasa_conversion_pct     | numeric                     | YES          | null                                                                 |
| public      | eventos_usuario          | 1        | id                      | bigint                      | NO           | nextval('eventos_usuario_id_seq'::regclass)                          |
| public      | eventos_usuario          | 2        | id_usuario              | uuid                        | NO           | null                                                                 |
| public      | eventos_usuario          | 3        | tipo                    | text                        | NO           | null                                                                 |
| public      | eventos_usuario          | 4        | id_prenda               | uuid                        | YES          | null                                                                 |
| public      | eventos_usuario          | 5        | termino                 | text                        | YES          | null                                                                 |
| public      | eventos_usuario          | 6        | categoria               | text                        | YES          | null                                                                 |
| public      | eventos_usuario          | 7        | creado_en               | timestamp with time zone    | YES          | now()                                                                |
| public      | favoritos                | 1        | id                      | uuid                        | NO           | gen_random_uuid()                                                    |
| public      | favoritos                | 2        | id_usuario              | uuid                        | NO           | null                                                                 |
| public      | favoritos                | 3        | id_prenda               | text                        | NO           | null                                                                 |
| public      | favoritos                | 4        | created_at              | timestamp with time zone    | YES          | now()                                                                |
| public      | mensajes                 | 1        | id                      | integer                     | NO           | nextval('mensajes_id_seq'::regclass)                                 |
| public      | mensajes                 | 2        | remitente_id            | character varying           | NO           | null                                                                 |
| public      | mensajes                 | 3        | destinatario_id         | character varying           | NO           | null                                                                 |
| public      | mensajes                 | 4        | contenido               | text                        | NO           | null                                                                 |
| public      | mensajes                 | 5        | leido                   | boolean                     | YES          | false                                                                |
| public      | mensajes                 | 6        | fecha                   | timestamp with time zone    | YES          | CURRENT_TIMESTAMP                                                    |
| public      | notificaciones           | 1        | id                      | integer                     | NO           | nextval('notificaciones_id_seq'::regclass)                           |
| public      | notificaciones           | 2        | usuario_id              | uuid                        | NO           | null                                                                 |
| public      | notificaciones           | 3        | tipo                    | character varying           | NO           | null                                                                 |
| public      | notificaciones           | 4        | titulo                  | character varying           | NO           | null                                                                 |
| public      | notificaciones           | 5        | cuerpo                  | text                        | YES          | null                                                                 |
| public      | notificaciones           | 6        | leida                   | boolean                     | YES          | false                                                                |
| public      | notificaciones           | 7        | created_at              | timestamp with time zone    | YES          | now()                                                                |
| public      | v_catalogo_publico       | 1        | id_prenda               | integer                     | YES          | null                                                                 |
| public      | v_catalogo_publico       | 2        | titulo                  | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 3        | descripcion             | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 4        | categoria               | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 5        | marca                   | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 6        | talla                   | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 7        | color                   | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 8        | precio                  | numeric                     | YES          | null                                                                 |
| public      | v_catalogo_publico       | 9        | genero                  | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 10       | condicion               | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 11       | fecha_publicacion       | timestamp without time zone | YES          | null                                                                 |
| public      | v_catalogo_publico       | 12       | vendedor                | text                        | YES          | null                                                                 |
| public      | v_catalogo_publico       | 13       | correo_vendedor         | character varying           | YES          | null                                                                 |
| public      | v_catalogo_publico       | 14       | imagen_principal        | character varying           | YES          | null                                                                 |
| public      | v_usuarios_publico       | 1        | id_auth_supabase        | uuid                        | YES          | null                                                                 |
| public      | v_usuarios_publico       | 2        | correo                  | character varying           | YES          | null                                                                 |
| public      | v_usuarios_publico       | 3        | primer_nombre           | character varying           | YES          | null                                                                 |
| public      | v_usuarios_publico       | 4        | primer_apellido         | character varying           | YES          | null                                                                 |
| public      | vendedor_comentarios     | 1        | id                      | integer                     | NO           | nextval('vendedor_comentarios_id_seq'::regclass)                     |
| public      | vendedor_comentarios     | 2        | vendedor_id             | character varying           | NO           | null                                                                 |
| public      | vendedor_comentarios     | 3        | autor_id                | character varying           | NO           | null                                                                 |
| public      | vendedor_comentarios     | 4        | autor_nombre            | character varying           | NO           | null                                                                 |
| public      | vendedor_comentarios     | 5        | autor_avatar            | character varying           | YES          | null                                                                 |
| public      | vendedor_comentarios     | 6        | calificacion            | integer                     | NO           | null                                                                 |
| public      | vendedor_comentarios     | 7        | contenido               | text                        | NO           | null                                                                 |
| public      | vendedor_comentarios     | 8        | fecha                   | timestamp with time zone    | YES          | CURRENT_TIMESTAMP                                                    |
| reputacion  | calificaciones           | 1        | id_calificacion         | integer                     | NO           | nextval('reputacion.calificaciones_id_calificacion_seq'::regclass)   |
| reputacion  | calificaciones           | 2        | id_comprador            | integer                     | NO           | null                                                                 |
| reputacion  | calificaciones           | 3        | id_vendedor             | integer                     | NO           | null                                                                 |
| reputacion  | calificaciones           | 4        | id_factura              | integer                     | NO           | null                                                                 |
| reputacion  | calificaciones           | 5        | id_prenda               | integer                     | YES          | null                                                                 |
| reputacion  | calificaciones           | 6        | puntuacion              | smallint                    | NO           | null                                                                 |
| reputacion  | calificaciones           | 7        | titulo                  | character varying           | YES          | null                                                                 |
| reputacion  | calificaciones           | 8        | fecha_calificacion      | timestamp without time zone | NO           | now()                                                                |
| reputacion  | calificaciones           | 9        | editado                 | boolean                     | NO           | false                                                                |
| reputacion  | calificaciones           | 10       | fecha_edicion           | timestamp without time zone | YES          | null                                                                 |
| reputacion  | calificaciones           | 11       | activo                  | boolean                     | NO           | true                                                                 |
| reputacion  | comentarios              | 1        | id_comentario           | integer                     | NO           | nextval('reputacion.comentarios_id_comentario_seq'::regclass)        |
| reputacion  | comentarios              | 2        | id_calificacion         | integer                     | NO           | null                                                                 |
| reputacion  | comentarios              | 3        | comentario              | character varying           | NO           | null                                                                 |
| reputacion  | comentarios              | 4        | fecha_creacion          | timestamp without time zone | NO           | now()                                                                |
| reputacion  | comentarios              | 5        | editado                 | boolean                     | NO           | false                                                                |
| reputacion  | comentarios              | 6        | fecha_edicion           | timestamp without time zone | YES          | null                                                                 |
| reputacion  | comentarios              | 7        | activo                  | boolean                     | NO           | true                                                                 |
| reputacion  | respuestas_vendedor      | 1        | id_respuesta            | integer                     | NO           | nextval('reputacion.respuestas_vendedor_id_respuesta_seq'::regclass) |
| reputacion  | respuestas_vendedor      | 2        | id_calificacion         | integer                     | NO           | null                                                                 |
| reputacion  | respuestas_vendedor      | 3        | id_vendedor             | integer                     | NO           | null                                                                 |
| reputacion  | respuestas_vendedor      | 4        | respuesta               | character varying           | NO           | null                                                                 |
| reputacion  | respuestas_vendedor      | 5        | fecha_respuesta         | timestamp without time zone | NO           | now()                                                                |
| reputacion  | respuestas_vendedor      | 6        | editado                 | boolean                     | NO           | false                                                                |
| reputacion  | respuestas_vendedor      | 7        | fecha_edicion           | timestamp without time zone | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 1        | id_calificacion         | integer                     | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 2        | puntuacion              | smallint                    | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 3        | titulo                  | character varying           | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 4        | fecha_calificacion      | timestamp without time zone | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 5        | comprador               | text                        | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 6        | vendedor                | text                        | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 7        | prenda_calificada       | character varying           | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 8        | comentario              | character varying           | YES          | null                                                                 |
| reputacion  | v_calificaciones_detalle | 9        | respuesta               | character varying           | YES          | null                                                                 |
| seguridad   | permisos                 | 1        | id_permiso              | integer                     | NO           | nextval('seguridad.permisos_id_permiso_seq'::regclass)               |
| seguridad   | permisos                 | 2        | nombre                  | character varying           | NO           | null                                                                 |
| seguridad   | permisos                 | 3        | descripcion             | character varying           | YES          | null                                                                 |
| seguridad   | rol_permisos             | 1        | id_rol                  | integer                     | NO           | null                                                                 |
| seguridad   | rol_permisos             | 2        | id_permiso              | integer                     | NO           | null                                                                 |
| seguridad   | roles                    | 1        | id_rol                  | integer                     | NO           | nextval('seguridad.roles_id_rol_seq'::regclass)                      |
| seguridad   | roles                    | 2        | nombre                  | character varying           | NO           | null                                                                 |
| seguridad   | sanciones                | 1        | id_sancion              | bigint                      | NO           | nextval('seguridad.sanciones_id_sancion_seq'::regclass)              |
| seguridad   | sanciones                | 2        | id_usuario              | integer                     | NO           | null                                                                 |
| seguridad   | sanciones                | 3        | admin_id                | uuid                        | NO           | null                                                                 |
| seguridad   | sanciones                | 4        | tipo                    | text                        | NO           | null                                                                 |
| seguridad   | sanciones                | 5        | razon                   | text                        | NO           | null                                                                 |
| seguridad   | sanciones                | 6        | fecha_sancion           | timestamp with time zone    | NO           | now()                                                                |
| seguridad   | usuarios                 | 1        | id_usuario              | integer                     | NO           | nextval('seguridad.usuarios_id_usuario_seq'::regclass)               |
| seguridad   | usuarios                 | 2        | id_rol                  | integer                     | NO           | null                                                                 |
| seguridad   | usuarios                 | 3        | primer_nombre           | character varying           | NO           | null                                                                 |
| seguridad   | usuarios                 | 4        | segundo_nombre          | character varying           | YES          | null                                                                 |
| seguridad   | usuarios                 | 5        | primer_apellido         | character varying           | NO           | null                                                                 |
| seguridad   | usuarios                 | 6        | segundo_apellido        | character varying           | YES          | null                                                                 |
| seguridad   | usuarios                 | 7        | correo                  | character varying           | NO           | null                                                                 |
| seguridad   | usuarios                 | 8        | telefono                | character                   | YES          | null                                                                 |
| seguridad   | usuarios                 | 9        | contrasena              | character varying           | YES          | null                                                                 |
| seguridad   | usuarios                 | 10       | fecha_registro          | timestamp without time zone | NO           | now()                                                                |
| seguridad   | usuarios                 | 11       | activo                  | boolean                     | NO           | true                                                                 |
| seguridad   | usuarios                 | 12       | genero                  | character varying           | YES          | null                                                                 |
| seguridad   | usuarios                 | 13       | fecha_nacimiento        | date                        | YES          | null                                                                 |
| seguridad   | usuarios                 | 14       | id_auth_supabase        | uuid                        | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 1        | id_usuario              | integer                     | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 2        | vendedor                | text                        | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 3        | correo                  | character varying           | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 4        | total_publicadas        | bigint                      | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 5        | disponibles             | bigint                      | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 6        | vendidas                | bigint                      | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 7        | pausadas                | bigint                      | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 8        | ingresos_totales        | numeric                     | YES          | null                                                                 |
| seguridad   | v_dashboard_vendedores   | 9        | precio_promedio_vendido | numeric                     | YES          | null                                                                 |
| ventas      | carrito_detalle          | 1        | id_carrito              | integer                     | NO           | null                                                                 |
| ventas      | carrito_detalle          | 2        | id_prenda               | integer                     | NO           | null                                                                 |
| ventas      | carrito_detalle          | 3        | precio                  | numeric                     | NO           | null                                                                 |
| ventas      | carrito_detalle          | 4        | fecha_agregado          | timestamp without time zone | NO           | now()                                                                |
| ventas      | carritos                 | 1        | id_carrito              | integer                     | NO           | nextval('ventas.carritos_id_carrito_seq'::regclass)                  |
| ventas      | carritos                 | 2        | id_comprador            | integer                     | NO           | null                                                                 |
| ventas      | carritos                 | 3        | estado                  | character varying           | NO           | 'ACTIVO'::character varying                                          |
| ventas      | carritos                 | 4        | fecha_creacion          | timestamp without time zone | NO           | now()                                                                |
| ventas      | v_carrito_activo         | 1        | id_carrito              | integer                     | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 2        | id_usuario              | integer                     | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 3        | comprador               | text                        | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 4        | correo                  | character varying           | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 5        | cantidad_items          | bigint                      | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 6        | total_carrito           | numeric                     | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 7        | fecha_creacion          | timestamp without time zone | YES          | null                                                                 |
| ventas      | v_carrito_activo         | 8        | dias_abierto            | numeric                     | YES          | null                                                                 |
| public      | pedidos                  | 1        | id                      | uuid                        | NO           | gen_random_uuid()                                                    |
| public      | pedidos                  | 2        | user_id                 | uuid                        | NO           | null                                                                 |
| public      | pedidos                  | 3        | vendedor_id             | uuid                        | NO           | null                                                                 |
| public      | pedidos                  | 4        | id_prenda               | integer                     | NO           | null                                                                 |
| public      | pedidos                  | 5        | titulo_prenda           | character varying           | NO           | null                                                                 |
| public      | pedidos                  | 6        | imagen_prenda           | character varying           | YES          | null                                                                 |
| public      | pedidos                  | 7        | precio                  | numeric                     | NO           | null                                                                 |
| public      | pedidos                  | 8        | total                   | numeric                     | NO           | null                                                                 |
| public      | pedidos                  | 9        | estado                  | text                        | NO           | 'completado'::text                                                   |
| public      | pedidos                  | 10       | metodo_pago             | text                        | YES          | 'simulado'::text                                                     |
| public      | pedidos                  | 11       | direccion_envio         | jsonb                       | YES          | null                                                                 |
| public      | pedidos                  | 12       | created_at              | timestamp with time zone    | YES          | now()                                                                |