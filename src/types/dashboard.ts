export interface ProductoRecomendado {
  id_prenda: string;
  titulo: string;
  precio: number;
  talla: string;
  condicion: string;
  vendedor: string;
  imagen_principal: string;
  categoria: string;
  razon?: string;
}
