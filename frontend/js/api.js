// Configuração central da API e utilitários compartilhados pelas páginas

const API_BASE_URL = 'http://localhost:3000/api';

const Storage = {
  TOKEN_KEY: 'meudinheiro_token',
  USER_KEY: 'meudinheiro_usuario',

  salvarSessao(token, usuario) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  },

  obterToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  obterUsuario() {
    const dados = localStorage.getItem(this.USER_KEY);
    return dados ? JSON.parse(dados) : null;
  },

  limparSessao() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },
};

// Wrapper de requisições para a API, já incluindo o token de autenticação
async function apiFetch(caminho, opcoes = {}) {
  const token = Storage.obterToken();

  const cabecalhos = {
    'Content-Type': 'application/json',
    ...(opcoes.headers || {}),
  };

  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${API_BASE_URL}${caminho}`, {
      ...opcoes,
      headers: cabecalhos,
    });
  } catch (erroRede) {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
  }

  const dados = await resposta.json().catch(() => ({}));

  if (resposta.status === 401) {
    Storage.limparSessao();
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Ocorreu um erro inesperado. Tente novamente.');
  }

  return dados;
}

// Garante que apenas usuários logados acessem páginas internas
function exigirAutenticacao() {
  if (!Storage.obterToken()) {
    window.location.href = 'login.html';
  }
}

// Redireciona usuários já logados para longe das páginas de autenticação
function redirecionarSeLogado() {
  if (Storage.obterToken()) {
    window.location.href = 'dashboard.html';
  }
}

// Evita injeção de HTML ao exibir textos vindos do usuário (categoria, descrição etc.)
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : String(texto);
  return div.innerHTML;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function exibirMensagem(elemento, texto, tipo = 'erro') {
  elemento.textContent = texto;
  elemento.className = `mensagem visivel ${tipo}`;
}

function ocultarMensagem(elemento) {
  elemento.className = 'mensagem';
  elemento.textContent = '';
}

// Marca o link ativo do menu lateral com base na página atual
function marcarNavegacaoAtiva() {
  const paginaAtual = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === paginaAtual) {
      link.classList.add('ativo');
    }
  });
}

// Preenche o nome do usuário logado no menu lateral e o botão de sair
function iniciarAppShell() {
  const usuario = Storage.obterUsuario();
  const nomeElemento = document.querySelector('[data-nome-usuario]');
  if (usuario && nomeElemento) {
    nomeElemento.textContent = usuario.name;
  }

  document.querySelectorAll('[data-botao-sair]').forEach((botaoSair) => {
    botaoSair.addEventListener('click', async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (erro) {
        // Mesmo que a chamada falhe, o logout local deve prosseguir
      } finally {
        Storage.limparSessao();
        window.location.href = 'login.html';
      }
    });
  });

  marcarNavegacaoAtiva();
}

const CATEGORIAS_ENTRADA = ['Salário', 'Freelance', 'Mesada', 'Outros'];
const CATEGORIAS_GASTO = ['Alimentação', 'Transporte', 'Estudos', 'Lazer', 'Compras', 'Contas', 'Outros'];
