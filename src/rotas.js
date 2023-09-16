const express = require('express')
const contas = require('./controladores/contas')
const intermediarios = require('./intermediarios')
const rotas = express()


rotas.get('/contas', intermediarios.validarSenha, contas.listarContas);
rotas.post('/contas', intermediarios.verificarItens, intermediarios.verificarCPFeEmail, contas.cadastrarConta)
rotas.put('/contas/:id', intermediarios.verificarItens, contas.atualizarConta)
rotas.delete('/contas/:id', contas.excluirConta)
rotas.post('/transacoes/depositar', contas.depositar)
rotas.post('/transacoes/sacar', contas.sacar)
rotas.post('/transacoes/transferir', contas.transferir)
rotas.get('/contas/saldo', contas.verSaldo)
rotas.get('/contas/extrato', contas.extrato)
module.exports = rotas