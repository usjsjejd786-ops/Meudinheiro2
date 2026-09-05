// Lógica da página de perfil

exigirAutenticacao();
iniciarAppShell();

const formDados = document.getElementById('form-dados');
const mensagemDados = document.getElementById('mensagem-dados');
const formSenha = document.getElementById('form-senha');
const mensagemSenha = document.getElementById('mensagem-senha');

document.addEventListener('DOMContentLoaded', carregarPerfil);

async function carregarPerfil() {
  try {
    const dados = await apiFetch('/users/profile');
    document.getElementById('email').value = dados.usuario.email;
    document.getElementById('name').value = dados.usuario.name;
  } catch (erro) {
    exibirMensagem(mensagemDados, erro.message, 'erro');
  }
}

function limparErrosCampo(formulario) {
  formulario.querySelectorAll('.erro-campo').forEach((el) => (el.textContent = ''));
}

function mostrarErroCampo(campo, texto) {
  const el = document.querySelector(`[data-erro-para="${campo}"]`);
  if (el) el.textContent = texto;
}

formDados.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  ocultarMensagem(mensagemDados);
  limparErrosCampo(formDados);

  const name = document.getElementById('name').value.trim();
  if (!name) {
    mostrarErroCampo('name', 'O nome não pode ficar em branco.');
    return;
  }

  const botao = document.getElementById('botao-salvar-dados');
  botao.disabled = true;
  botao.textContent = 'Salvando...';

  try {
    const dados = await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });

    const usuarioAtual = Storage.obterUsuario();
    Storage.salvarSessao(Storage.obterToken(), { ...usuarioAtual, name: dados.usuario.name });

    exibirMensagem(mensagemDados, 'Dados atualizados com sucesso.', 'sucesso');
    document.querySelector('[data-nome-usuario]').textContent = dados.usuario.name;
  } catch (erro) {
    exibirMensagem(mensagemDados, erro.message, 'erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Salvar alterações';
  }
});

formSenha.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  ocultarMensagem(mensagemSenha);
  limparErrosCampo(formSenha);

  const senhaAtual = document.getElementById('senhaAtual').value;
  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;

  let valido = true;
  if (!senhaAtual) {
    mostrarErroCampo('senhaAtual', 'Informe sua senha atual.');
    valido = false;
  }
  if (!novaSenha || novaSenha.length < 6) {
    mostrarErroCampo('novaSenha', 'A nova senha deve ter pelo menos 6 caracteres.');
    valido = false;
  }
  if (confirmarNovaSenha !== novaSenha) {
    mostrarErroCampo('confirmarNovaSenha', 'As senhas não coincidem.');
    valido = false;
  }
  if (!valido) return;

  const botao = document.getElementById('botao-salvar-senha');
  botao.disabled = true;
  botao.textContent = 'Atualizando...';

  try {
    await apiFetch('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });

    exibirMensagem(mensagemSenha, 'Senha atualizada com sucesso.', 'sucesso');
    formSenha.reset();
  } catch (erro) {
    exibirMensagem(mensagemSenha, erro.message, 'erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Atualizar senha';
  }
});
