// Formatos devolvidos pela agroStock API (ver agroStock_API/README.md).

export interface Usuario {
  id: number;
  login: string;
}

export interface Insumo {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  minimo: number;
}

export interface Lote {
  id: number;
  insumoId: number;
  codigo: string;
  validade: string; // AAAA-MM-DD
  saldo: number;
}

export type TipoMovimentacao = "E" | "S";

export interface Movimentacao {
  id: number;
  loteId: number;
  loteCodigo?: string;
  insumoId?: number;
  insumoNome?: string;
  unidade?: string;
  usuarioId: number;
  usuarioLogin?: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  instante: string; // AAAA-MM-DDTHH:MM:SS (hora local do servidor)
  motivo: string | null;
  chaveRequisicao: string;
  saldoLote?: number; // saldo do lote logo após a operação
}

export interface SaldoInsumo {
  insumoId: number;
  nome: string;
  categoria: string;
  unidade: string;
  minimo: number;
  saldoTotal: number;
  abaixoMinimo: boolean;
  lotes: { loteId: number; codigo: string; validade: string; saldo: number }[];
}

export interface Alerta {
  loteId: number;
  loteCodigo: string;
  insumoId: number;
  insumoNome: string;
  unidade: string;
  saldo: number;
  validade: string;
  diasRestantes: number;
  vencido: boolean;
  nivel: "vermelho" | "amarelo";
}

export interface RespostaAlertas {
  dataReferencia: string;
  alertas: Alerta[];
}
