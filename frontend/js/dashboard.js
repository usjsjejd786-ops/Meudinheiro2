// Lógica da página de painel (dashboard)

exigirAutenticacao();
iniciarAppShell();

const PALETA_CATEGORIAS = ['#c9973f', '#5fa87c', '#c2603f', '#7690b8', '#a878c4', '#d1b464', '#6fb0ad'];

document.addEventListener('DOMContentLoaded', () => {
  const usuario = Storage.obterUsuario();
  if (usuario) {
    document.getElementById('saudacao').textContent = `Olá, ${usuario.name}. Aqui está o resumo da sua vida financeira.`;
  }

  carregarResumo();
  carregarGraficoCategorias();
  carregarGraficoMensal();
  configurarModalTransacao();
});

async function carregarResumo() {
  try {
    const dados = await apiFetch('/dashboard/summary');

    document.getElementById('valor-saldo').textContent = formatarMoeda(dados.saldo);
    document.getElementById('valor-entradas').textContent = formatarMoeda(dados.totalEntradas);
    document.getElementById('valor-gastos').textContent = formatarMoeda(dados.totalGastos);
    document.getElementById('valor-gastos-mes').textContent = formatarMoeda(dados.gastosDoMes);

    renderizarUltimasTransacoes(dados.ultimasTransacoes || []);
  } catch (erro) {
    document.getElementById('lista-ultimas-transacoes').innerHTML =
      `<div class="estado-vazio">${erro.message}</div>`;
  }
}

function renderizarUltimasTransacoes(transacoes) {
  const lista = document.getElementById('lista-ultimas-transacoes');

  if (transacoes.length === 0) {
    lista.innerHTML = '<div class="estado-vazio">Você ainda não tem transações. Que tal lançar a primeira?</div>';
    return;
  }

  lista.innerHTML = transacoes.map((transacao) => `
    <div class="linha-transacao">
      <div class="descricao-transacao">
        <span class="categoria-transacao">${escaparHtml(transacao.category)}</span>
        <span class="meta-transacao">${formatarData(transacao.date)}${transacao.description ? ' · ' + escaparHtml(transacao.description) : ''}</span>
      </div>
      <span class="valor-transacao ${transacao.type}">${transacao.type === 'entrada' ? '+' : '–'} ${formatarMoeda(transacao.amount)}</span>
      <span></span>
    </div>
  `).join('');
}

async function carregarGraficoCategorias() {
  const canvas = document.getElementById('grafico-categorias');
  const legenda = document.getElementById('legenda-categorias');

  try {
    const dados = await apiFetch('/dashboard/categories');
    const gastos = (dados.categorias || []).filter((c) => c.tipo === 'gasto');

    if (gastos.length === 0) {
      desenharEstadoVazioGrafico(canvas, 'Sem gastos registrados ainda.');
      legenda.innerHTML = '';
      return;
    }

    desenharGraficoDonut(canvas, gastos);

    legenda.innerHTML = gastos.map((item, indice) => `
      <span class="legenda-item">
        <span class="marcador-legenda" style="background:${PALETA_CATEGORIAS[indice % PALETA_CATEGORIAS.length]}"></span>
        ${escaparHtml(item.categoria)}
      </span>
    `).join('');
  } catch (erro) {
    desenharEstadoVazioGrafico(canvas, 'Não foi possível carregar o gráfico.');
  }
}

function desenharGraficoDonut(canvas, itens) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const total = itens.reduce((soma, item) => soma + item.total, 0);
  const centroX = width / 2;
  const centroY = height / 2;
  const raioExterno = Math.min(width, height) / 2 - 10;
  const raioInterno = raioExterno * 0.6;

  let anguloAtual = -Math.PI / 2;

  itens.forEach((item, indice) => {
    const fatia = (item.total / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.fillStyle = PALETA_CATEGORIAS[indice % PALETA_CATEGORIAS.length];
    ctx.moveTo(centroX, centroY);
    ctx.arc(centroX, centroY, raioExterno, anguloAtual, anguloAtual + fatia);
    ctx.closePath();
    ctx.fill();
    anguloAtual += fatia;
  });

  // Furo central para o efeito "donut"
  ctx.beginPath();
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--tinta-800') || '#16233a';
  ctx.arc(centroX, centroY, raioInterno, 0, Math.PI * 2);
  ctx.fill();
}

function desenharEstadoVazioGrafico(canvas, texto) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#cfc6b2';
  ctx.font = '14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
}

async function carregarGraficoMensal() {
  const canvas = document.getElementById('grafico-mensal');

  try {
    const dados = await apiFetch('/dashboard/monthly');
    const meses = dados.meses || [];

    if (meses.length === 0) {
      desenharEstadoVazioGrafico(canvas, 'Sem dados suficientes ainda.');
      return;
    }

    desenharGraficoBarrasAgrupadas(canvas, meses);
  } catch (erro) {
    desenharEstadoVazioGrafico(canvas, 'Não foi possível carregar o gráfico.');
  }
}

function desenharGraficoBarrasAgrupadas(canvas, meses) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const margemInferior = 34;
  const margemLateral = 20;
  const areaGrafico = height - margemInferior - 16;

  const valorMaximo = Math.max(
    ...meses.map((m) => Math.max(m.entradas, m.gastos)),
    1
  );

  const larguraGrupo = (width - margemLateral * 2) / meses.length;
  const larguraBarra = Math.min(28, larguraGrupo / 3);

  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = '#cfc6b2';
  ctx.textAlign = 'center';

  meses.forEach((mes, indice) => {
    const centroGrupo = margemLateral + larguraGrupo * indice + larguraGrupo / 2;

    const alturaEntrada = (mes.entradas / valorMaximo) * areaGrafico;
    const alturaGasto = (mes.gastos / valorMaximo) * areaGrafico;

    ctx.fillStyle = '#5fa87c';
    ctx.fillRect(
      centroGrupo - larguraBarra - 3,
      areaGrafico - alturaEntrada + 16,
      larguraBarra,
      alturaEntrada
    );

    ctx.fillStyle = '#c2603f';
    ctx.fillRect(
      centroGrupo + 3,
      areaGrafico - alturaGasto + 16,
      larguraBarra,
      alturaGasto
    );

    ctx.fillStyle = '#cfc6b2';
    const [ano, mesNumero] = mes.mes.split('-');
    const rotuloMes = new Date(`${ano}-${mesNumero}-01T00:00:00`).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    });
    ctx.fillText(rotuloMes, centroGrupo, height - 10);
  });
}

// ---------- Modal de nova transação ----------

function configurarModalTransacao() {
  const sobreposicao = document.getElementById('sobreposicao-transacao');
  const botaoAbrir = document.getElementById('botao-nova-transacao');
  const form = document.getElementById('form-transacao');
  const mensagemModal = document.getElementById('mensagem-modal');
  const seletorCategoria = document.getElementById('category');
  const inputData = document.getElementById('date');

  function preencherCategorias(tipo) {
    const categorias = tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_GASTO;
    seletorCategoria.innerHTML = categorias.map((c) => `<option value="${c}">${c}</option>`).join('');
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

  function abrirModal() {
    form.reset();
    document.querySelector('input[name="type"][value="entrada"]').checked = true;
    preencherCategorias('entrada');
    atualizarEstiloOpcoes();
    inputData.value = new Date().toISOString().slice(0, 10);
    ocultarMensagem(mensagemModal);
    sobreposicao.classList.add('visivel');
  }

  function fecharModal() {
    sobreposicao.classList.remove('visivel');
  }

  botaoAbrir.addEventListener('click', abrirModal);
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

    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: dadosFormulario.get('type'),
          amount: dadosFormulario.get('amount'),
          category: dadosFormulario.get('category'),
          date: dadosFormulario.get('date'),
          description: dadosFormulario.get('description'),
        }),
      });

      fecharModal();
      carregarResumo();
      carregarGraficoCategorias();
      carregarGraficoMensal();
    } catch (erro) {
      exibirMensagem(mensagemModal, erro.message, 'erro');
    } finally {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = 'Salvar';
    }
  });
}
