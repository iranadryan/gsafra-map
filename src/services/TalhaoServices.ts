import { TalhaoResponseType } from '../types/talhao';
import api from './utils/api';

interface GetTalhoesParams {
  idEmpresa: number;
  idFazenda: number;
}

export async function requestGetTalhoes({
  idEmpresa,
  idFazenda,
}: GetTalhoesParams) {
  try {
    const { data }: { data: TalhaoResponseType[] } = await api.get('/talhoes', {
      headers: { 'Id-Empresa': idEmpresa },
      params: { 'id-fazenda': idFazenda },
    });

    return data;
  } catch (error: any) {
    return [];
  }
}
