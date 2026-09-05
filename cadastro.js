// Lógica da página de cadastro

redirecionarSeLogado();

const formCadastro = document.getElementById('form-cadastro');
const mensagem = document.getElementById('mensagem');
const botaoCadastro = document.getElementById('botao-cadastro');

function limparErrosCampo() {
  document.querySelectorAll('.erro-campo').forEach((el) => (el.textContent = ''));
}

function mostrarErroCampo(campo, texto) {
  const el = document.querySelector(`[data-erro-para="${campo}"]`);
  if (el) el.textContent = texto;
}

function validarFormulario({ name, email, password, confirmarSenha }) {
  let valido = true;

  if (!name) {
    mostrarErroCampo('name', 'Informe seu nome.');
    valido = false;
  }

  if (!email) {
    mostrarErroCampo('email', 'Informe seu e-mail.');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarErroCampo('email', 'Informe um e-mail válido.');
    valido = false;
  }

  if (!password) {
    mostrarErroCampo('password', 'Informe uma senha.');
    valido = false;
  } else if (password.length < 6) {
    mostrarErroCampo('password', 'A senha deve ter pelo menos 6 caracteres.');
    valido = false;
  }

  if (!confirmarSenha) {
    mostrarErroCampo('confirmarSenha', 'Confirme sua senha.');
    valido = false;
  } else if (password && confirmarSenha !== password) {
    mostrarErroCampo('confirmarSenha', 'As senhas não coincidem.');
    valido = false;
  }

  return valido;
}

formCadastro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  ocultarMensagem(mensagem);
  limparErrosCampo();

  const dadosFormulario = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmarSenha: document.getElementById('confirmarSenha').value,
  };

  if (!validarFormulario(dadosFormulario)) return;

  botaoCadastro.disabled = true;
  botaoCadastro.textContent = 'Criando conta...';

  try {
    const dados = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: dadosFormulario.name,
        email: dadosFormulario.email,
        password: dadosFormulario.password,
      }),
    });

    Storage.salvarSessao(dados.token, dados.usuario);
    window.location.href = 'dashboard.html';
  } catch (erro) {
    exibirMensagem(mensagem, erro.message, 'erro');
    botaoCadastro.disabled = false;
    botaoCadastro.textContent = 'Criar conta';
  }
});
