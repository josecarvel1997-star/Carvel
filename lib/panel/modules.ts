import type { MemberRole } from './types';

export const MODULES = ['agenda', 'atendimentos', 'clientes', 'servicos', 'equipe', 'horarios', 'fila', 'recuperacao', 'fidelizacao', 'financeiro', 'estoque', 'relatorios', 'alertas', 'metas', 'notificacoes', 'configuracoes', 'comissoes'] as const;

/** Módulos com tabelas reais no banco. Os demais aparecem com o selo “Em breve”. */
export const REAL_MODULES = ['agenda', 'atendimentos', 'clientes', 'servicos', 'equipe', 'horarios', 'financeiro', 'estoque', 'comissoes', 'alertas'];

/** Espelha as políticas RLS: cada papel só vê o módulo cujas tabelas consegue ler. */
export const ALLOWED_MODULES: Record<MemberRole, string[]> = {
  owner: [...MODULES],
  manager: ['agenda', 'atendimentos', 'clientes', 'servicos', 'equipe', 'horarios', 'financeiro', 'estoque', 'comissoes', 'alertas', 'fila', 'recuperacao', 'fidelizacao', 'notificacoes'],
  barber: ['agenda', 'atendimentos', 'clientes', 'comissoes'],
  receptionist: ['agenda', 'atendimentos', 'clientes', 'financeiro', 'alertas', 'fila', 'recuperacao', 'notificacoes'],
};

export const PAGE_INFO: Record<string, { title: string; description: string }> = {
  '': { title: 'Visão geral', description: 'Acompanhe a agenda de hoje do seu espaço.' },
  agenda: { title: 'Agenda', description: 'Organize horários, serviços e profissionais.' },
  atendimentos: { title: 'Atendimentos', description: 'Cada atendimento do dia, do agendamento à comanda paga.' },
  clientes: { title: 'Clientes', description: 'Cadastro, contato e histórico de cada cliente.' },
  servicos: { title: 'Serviços', description: 'Catálogo, preços, duração e salas/recursos.' },
  equipe: { title: 'Equipe', description: 'Profissionais, funções e percentuais de comissão.' },
  horarios: { title: 'Horários', description: 'Dias e horários de funcionamento usados pela agenda e pela página pública.' },
  fila: { title: 'Fila de espera', description: 'Organize as chegadas sem horário marcado.' },
  recuperacao: { title: 'Clientes para retornar', description: 'Veja quem está há algum tempo sem visitar seu espaço.' },
  fidelizacao: { title: 'Fidelização', description: 'Benefícios para quem volta sempre.' },
  financeiro: { title: 'Caixa e financeiro', description: 'Caixa do dia, vendas no PDV, lançamentos e taxas de pagamento.' },
  estoque: { title: 'Produtos e estoque', description: 'Produtos, quantidades, reservas em comandas e reposição.' },
  relatorios: { title: 'Relatórios', description: 'Indicadores para acompanhar sua operação.' },
  configuracoes: { title: 'Configurações', description: 'Dados do espaço e preferências.' },
  notificacoes: { title: 'Mensagens', description: 'Modelos de mensagem para clientes.' },
  comissoes: { title: 'Comissões', description: 'Comissões apuradas no fechamento de cada comanda.' },
  alertas: { title: 'Central de alertas', description: 'Estoque no mínimo e clientes que podem estar na hora de voltar.' },
  metas: { title: 'Metas', description: 'Objetivos do período.' },
};
