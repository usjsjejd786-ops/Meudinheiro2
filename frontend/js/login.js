// Lógica da página de login

redirecionarSeLogado();

const formLogin = document.getElementById('form-login');
const mensagem = document.getElementById('mensagem');
const botaoLogin = document.getElementById('botao-login');

function limparErrosCampo() {
  document.querySelectorAll('.erro-campo').forEach((el) => (el.textContent = ''));
}

function mostrarErroCampo(campo, texto) {
  const el = document.querySelector(`[data-erro-para="${campo}"]`);
  if (el) el.textContent = texto;
}

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  ocultarMensagem(mensagem);
  limparErrosCampo();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  let valido = true;
  if (!email) {
    mostrarErroCampo('email', 'Informe seu e-mail.');
    valido = false;
  }
  if (!password) {
    mostrarErroCampo('password', 'Informe sua senha.');
    valido = false;
  }
  if (!valido) return;

  botaoLogin.disabled = true;
  botaoLogin.textContent = 'Entrando...';

  try {
    const dados = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    Storage.salvarSessao(dados.token, dados.usuario);
    window.location.href = 'dashboard.html';
  } catch (erro) {
    exibirMensagem(mensagem, erro.message, 'erro');
    botaoLogin.disabled = false;
    botaoLogin.textContent = 'Entrar';
  }
});
