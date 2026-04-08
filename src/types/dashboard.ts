export interface ProductoRecomendado {
  id_prenda: number;
  titulo: string;
  precio: number;
  talla: string;
  condicion: string;
  vendedor: string;
  imagen_principal: string;
  categoria: string;
  razon?: string;
}
