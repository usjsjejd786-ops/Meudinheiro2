// Lógica da página de transações

exigirAutenticacao();
iniciarAppShell();

const listaTransacoes = document.getElementById('lista-transacoes');
const formFiltros = document.getElementById('form-filtros');
const seletorFiltroCategoria = document.getElementById('filtro-categoria');

document.addEventListener('DOMContentLoaded', () => {
  preencherFiltroCategorias();
  carregarTransacoes();
  configurarModalTransacao();
});

function preencherFiltroCategorias() {
  const todasCategorias = [...new Set([...CATEGORIAS_ENTRADA, ...CATEGORIAS_GASTO])];
  seletorFiltroCategoria.innerHTML =
    '<option value="">Todas</option>' +
    todasCategorias.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function obterFiltrosAtuais() {
  const dados = new FormData(formFiltros);
  const parametros = new URLSearchParams();

  ['tipo', 'categoria', 'dataInicio', 'dataFim'].forEach((chave) => {
    const valor = dados.get(chave);
    if (valor) parametros.set(chave, valor);
  });

  return parametros.toString();
}

async function carregarTransacoes() {
  listaTransacoes.innerHTML = '<div class="estado-vazio">Carregando transações...</div>';

  try {
    const query = obterFiltrosAtuais();
    const dados = await apiFetch(`/transactions${query ? '?' + query : ''}`);
    renderizarTransacoes(dados.transacoes || []);
  } catch (erro) {
    listaTransacoes.innerHTML = `<div class="estado-vazio">${erro.message}</div>`;
  }
}

function renderizarTransacoes(transacoes) {
  if (transacoes.length === 0) {
    listaTransacoes.innerHTML = '<div class="estado-vazio">Nenhuma transação encontrada para os filtros selecionados.</div>';
    return;
  }

  listaTransacoes.innerHTML = transacoes.map((transacao) => `
    <div class="linha-transacao" data-id="${transacao.id}">
      <div class="descricao-transacao">
        <span class="categoria-transacao">${escaparHtml(transacao.category)}</span>
        <span class="meta-transacao">${formatarData(transacao.date)}${transacao.description ? ' · ' + escaparHtml(transacao.description) : ''}</span>
      </div>
      <span class="valor-transacao ${transacao.type}">${transacao.type === 'entrada' ? '+' : '–'} ${formatarMoeda(transacao.amount)}</span>
      <div class="acoes-linha">
        <button class="editar" data-acao="editar" data-id="${transacao.id}">Editar</button>
        <button class="excluir" data-acao="excluir" data-id="${transacao.id}">Excluir</button>
      </div>
    </div>
  `).join('');

  listaTransacoes.querySelectorAll('[data-acao="editar"]').forEach((botao) => {
    botao.addEventListener('click', () => abrirModalEdicao(botao.dataset.id));
  });

  listaTransacoes.querySelectorAll('[data-acao="excluir"]').forEach((botao) => {
    botao.addEventListener('click', () => excluirTransacao(botao.dataset.id));
  });
}

async function excluirTransacao(id) {
  const confirmado = window.confirm('Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.');
  if (!confirmado) return;

  try {
    await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
    carregarTransacoes();
  } catch (erro) {
    window.alert(erro.message);
  }
}

formFiltros.addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarTransacoes();
});

document.getElementById('botao-limpar-filtros').addEventListener('click', () => {
  formFiltros.reset();
  carregarTransacoes();
});

// ---------- Modal (criar e editar) ----------

let modalEmModoEdicao = false;

function configurarModalTransacao() {
  const sobreposicao = document.getElementById('sobreposicao-transacao');
  const botaoAbrir = document.getElementById('botao-nova-transacao');
  const form = document.getElementById('form-transacao');
  const mensagemModal = document.getElementById('mensagem-modal');
  const seletorCategoria = document.getElementById('category');
  const inputData = document.getElementById('date');
  const inputId = document.getElementById('transacao-id');
  const tituloModal = document.getElementById('titulo-modal');

  function preencherCategorias(tipo, categoriaSelecionada) {
    const categorias = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_GASTO;
    seletorCategoria.innerHTML = categorias.map((c) => `<option value="${c}">${c}</option>`).join('');
    if (categoriaSelecionada) seletorCategoria.value = categoriaSelecionada;
  }

  function atualizarEstiloOpcoes() {
    document.querySelectorAll('[data-opcao-tipo]').forEach((rotulo) => {
      const marcado = rotulo.querySelector('input').checked;
      const tipo = rotulo.dataset.opcaoTipo;
      rotulo.classList.toggle(`selecionado-${tipo}`, marcado);
    });
  }

  document.querySelectorAll('input[name="type"]').forEach((input) => {
    input.addEventListener('change', () => {
      preencherCategorias(input.value);
      atualizarEstiloOpcoes();
    });
  });

  window.abrirModalCriacao = function abrirModalCriacao() {
    modalEmModoEdicao = false;
    form.reset();
    inputId.value = '';
    tituloModal.textContent = 'Nova transação';
    document.querySelector('input[name="type"][value="entrada"]').checked = true;
    preencherCategorias('entrada');
    atualizarEstiloOpcoes();
    inputData.value = new Date().toISOString().slice(0, 10);
    ocultarMensagem(mensagemModal);
    sobreposicao.classList.add('visivel');
  };

  window.abrirModalEdicaoInterno = async function abrirModalEdicaoInterno(id) {
    try {
      const dados = await apiFetch(`/transactions/${id}`);
      const transacao = dados.transacao;

      modalEmModoEdicao = true;
      inputId.value = transacao.id;
      tituloModal.textContent = 'Editar transação';

      document.querySelector(`input[name="type"][value="${transacao.type}"]`).checked = true;
      preencherCategorias(transacao.type, transacao.category);
      atualizarEstiloOpcoes();

      document.getElementById('amount').value = transacao.amount;
      document.getElementById('date').value = transacao.date;
      document.getElementById('description').value = transacao.description || '';

      ocultarMensagem(mensagemModal);
      sobreposicao.classList.add('visivel');
    } catch (erro) {
      window.alert(erro.message);
    }
  };

  function fecharModal() {
    sobreposicao.classList.remove('visivel');
  }

  botaoAbrir.addEventListener('click', () => window.abrirModalCriacao());
  document.querySelectorAll('[data-fechar-modal]').forEach((el) => el.addEventListener('click', fecharModal));
  sobreposicao.addEventListener('click', (evento) => {
    if (evento.target === sobreposicao) fecharModal();
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    ocultarMensagem(mensagemModal);

    const botaoSalvar = document.getElementById('botao-salvar-transacao');
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = 'Salvando...';

    const dadosFormulario = new FormData(form);
    const corpo = JSON.stringify({
      type: dadosFormulario.get('type'),
      amount: dadosFormulario.get('amount'),
      category: dadosFormulario.get('category'),
      date: dadosFormulario.get('date'),
      description: dadosFormulario.get('description'),
    });

    try {
      if (modalEmModoEdicao) {
        await apiFetch(`/transactions/${inputId.value}`, { method: 'PUT', body: corpo });
      } else {
        await apiFetch('/transactions', { method: 'POST', body: corpo });
      }

      fecharModal();
      carregarTransacoes();
    } catch (erro) {
      exibirMensagem(mensagemModal, erro.message, 'erro');
    } finally {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = 'Salvar';
    }
  });
}

function abrirModalEdicao(id) {
  window.abrirModalEdicaoInterno(id);
}
