import type { MemberRole } from './types';

export const MODULES = ['agenda', 'atendimentos', 'clientes', 'servicos', 'equipe', 'horarios', 'fila', 'recuperacao', 'fidelizacao', 'financeiro', 'estoque', 'relatorios', 'alertas', 'metas', 'notificacoes', 'configuracoes', 'comissoes'] as const;
export const REAL_MODULES = ['agenda', 'atendimentos', 'clientes', 'servicos', 'equipe', 'horarios'];

export const ALLOWED_MODULES: Record<MemberRole, string[]> = {
  owner: [...MODULES],
  manager: ['agenda', 'atendimentos', 'clientes', 'servicos', 'equipe', 'horarios', 'fila', 'recuperacao', 'estoque', 'fidelizacao', 'alertas', 'notificacoes'],
  barber: ['agenda', 'atendimentos', 'clientes', 'comissoes'],
  receptionist: ['agenda', 'atendimentos', 'clientes', 'fila', 'recuperacao', 'notificacoes'],
};

export const PAGE_INFO: Record<string, { title: string; description: string }> = {
  '': { title: 'Visão geral', description: 'Acompanhe a agenda de hoje do seu espaço.' },
  agenda: { title: 'Agenda', description: 'Organize horários, serviços e profissionais.' },
  atendimentos: { title: 'Atendimentos', description: 'Acompanhe cada atendimento do dia, do agendamento à conclusão.' },
  clientes: { title: 'Clientes', description: 'Cadastro, contato e histórico de cada cliente.' },
  servicos: { title: 'Serviços', description: 'Organize seu catálogo, preços e duração dos atendimentos.' },
  equipe: { title: 'Equipe', description: 'Profissionais, funções e comissões.' },
  horarios: { title: 'Horários', description: 'Dias e horários de atendimento da barbearia e de cada profissional.' },
  fila: { title: 'Fila de espera', description: 'Organize as chegadas sem horário marcado.' },
  recuperacao: { title: 'Clientes para retornar', description: 'Veja quem está há algum tempo sem visitar seu espaço.' },
  fidelizacao: { title: 'Fidelização', description: 'Benefícios para quem volta sempre.' },
  financeiro: { title: 'Financeiro', description: 'Receitas, despesas e movimentações do negócio.' },
  estoque: { title: 'Produtos e estoque', description: 'Produtos, quantidades e reposição.' },
  relatorios: { title: 'Relatórios', description: 'Indicadores para acompanhar sua operação.' },
  configuracoes: { title: 'Configurações', description: 'Dados do espaço e preferências.' },
  notificacoes: { title: 'Mensagens', description: 'Modelos de mensagem para clientes.' },
  comissoes: { title: 'Comissões', description: 'Apuração de comissões por profissional.' },
  alertas: { title: 'Alertas', description: 'Avisos sobre a operação.' },
  metas: { title: 'Metas', description: 'Objetivos do período.' },
};
