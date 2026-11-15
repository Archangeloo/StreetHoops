// Rotas funcionais do Street Hoops.
export const routeDefinitions = [
  { code: 'T01', path: '/', title: 'Boas-vindas', guest: true, description: 'Entrada, cadastro ou login' },
  { code: 'T02', path: '/cadastro', title: 'Cadastro', guest: true, description: 'Dados de cadastro e termos de uso' },
  { code: 'T03', path: '/login', title: 'Login', guest: true, description: 'Autenticação por e-mail e senha' },
  { code: 'T04', path: '/recuperar-senha', title: 'Recuperar senha', guest: true, description: 'Solicitação segura de redefinição' },
  { code: 'T05', path: '/inicio', title: 'Início', guest: false, description: 'Partidas abertas, vitórias, nível e Elo' },
  { code: 'T06', path: '/quadras', title: 'Quadras', guest: false, description: 'Mapa, lista e filtros de situação' },
  { code: 'T07', path: '/quadras/nova', title: 'Cadastrar quadra', guest: false, description: 'Formulário sujeito à moderação' },
  { code: 'T08', path: '/quadras/:id/checkin', title: 'Check-in', guest: false, description: 'Entrada e saída manual em uma quadra' },
  { code: 'T09', path: '/partidas/nova', title: 'Criar partida', guest: false, description: 'Fluxo de criação em cinco passos' },
  { code: 'T10', path: '/partidas/:id', title: 'Partida', guest: false, description: 'Busca e convites em tempo real' },
  { code: 'T11', path: '/partidas/:id/resumo', title: 'Resumo e placar', guest: false, description: 'Confirmação e resultados' },
  { code: 'T12', path: '/perfil', title: 'Perfil', guest: false, description: 'XP, Elo, ranking e histórico' },
  { code: 'T13', path: '/perfil/editar', title: 'Editar perfil', guest: false, description: 'Foto, usuário, senha e telefone' },
  { code: 'T14', path: '/amigos', title: 'Amigos', guest: false, description: 'Buscar, adicionar e desafiar' },
  { code: 'T15', path: '/social', title: 'Equipe', guest: false, description: 'Gerenciar membros e convites' },
];
