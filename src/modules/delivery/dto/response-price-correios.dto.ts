export interface CorreiosResponse {
  Servicos: {
    cServico: Servico[];
  };
}

export interface Servico {
  Codigo: string;
  PrazoEntrega: string;
}
