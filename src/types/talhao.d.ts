export type TalhaoType = {
  id: number;
  descricao: string;
  hectares: number;
  coordenadas: string;
}

export type CoordinatesType = {
  lat: number;
  lng: number;
};

export type TalhaoResponseType = {
  id: number;
  id_empresa: number;
  id_origem?: number;
  id_fazenda?: number;
  descricao: string;
  hectares: string;
  coordenadas: string;
  data_atualizacao: string;
  excluido: number;
}
