const { format } = require('date-fns')
const { unificarCPF, unificarEmail, localizarConta } = require('../intermediarios')
let { contas, identificadorConta, saldo, depositos, saques, transferencias  } = require('../bancodedados')
const transacoes ={depositos,saques,transferencias} 

const listarContas = (req, res) => {
    return res.json(contas)
}

const cadastrarConta = (req, res) => {
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(401).json({ mensagem: 'O preenchimento de todos os itens é obrigatório!' })
    }

    cpf = unificarCPF(cpf)
    email = unificarEmail(email)

    saldo = 0

    const conta = {
        numeroDaconta: identificadorConta++,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha,
        saldo
    }

    contas.push(conta)

    return res.status(201).json()
}

const atualizarConta = (req, res) => {

    const { id } = req.params
    const conta = localizarConta(id)
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' })
    }

    cpf = unificarCPF(cpf)
    email = unificarEmail(email)

    const verificarContas = contas.filter((conta) => {
        return conta.numeroDaconta != Number(id)
    })

    const verificarCpf = verificarContas.find((verificador) => {
        return verificador.cpf == cpf
    })
    if (verificarCpf) {
        return res.status(401).json({ mensagem: 'O cpf já existe!' })
    }

    const verificarEmail = verificarContas.find((verificador) => {
        return verificador.email == email
    })
    if (verificarEmail) {
        return res.status(401).json({ mensagem: 'O email já existe!' })
    }

    conta.nome = nome
    conta.cpf = cpf
    conta.data_nascimento = data_nascimento
    conta.telefone = telefone
    conta.email = email
    conta.senha = senha

    return res.status(204).send()
}

const excluirConta = (req, res) => {

    const { id } = req.params
    const conta = localizarConta(id)
    
    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' })
    }

    if (conta.saldo != 0) {
        return res.status(401).json({ mensagem: 'Não é possível excluir conta com saldo existente.' })
    }

    contas = contas.filter((conta) => {
        return conta.numeroDaconta != Number(id)
    })

    return res.status(204).send(console.log(contas))
}

const depositar = (req, res) => {

    let { numero_conta, valor } = req.body
    if (!numero_conta || !valor) {
        return res.status(401).json({ mensagem: 'O número da conta e o valor são obrigatórios!' })
    }

    const conta = localizarConta(numero_conta)
    
    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' })
    }

    valor = Number(valor)
    saldo = Number(conta.saldo)

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor informado é inválido!' })
    }

    const novoSaldo = saldo + valor
    conta.saldo = novoSaldo

    const deposito = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta: numero_conta,
        valor: valor
    }
    depositos.push(deposito)

    return res.status(204).json()
}

const sacar = (req, res) => {

    let { numero_conta, valor, senha } = req.body
    if (!numero_conta || !valor || !senha) {
        return res.status(401).json({ mensagem: 'O número da conta, valor e senha são obrigatórios!' })
    }

    const conta = localizarConta(numero_conta)
    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' })
    }

    if (senha != conta.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' })
    }

    valor = Number(valor)
    saldo = Number(conta.saldo)

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor informado é inválido!' })
    }

    if (valor > conta.saldo) {
        return res.status(401).json({ mensagem: 'Saldo insuficiente!' })
    }

    const novoSaldo = saldo - valor
    conta.saldo = novoSaldo

    const saque = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta: numero_conta,
        valor: valor
    }
    saques.push(saque)

    return res.status(204).json()
}

const transferir = (req, res) => {

    let { numero_conta_origem, numero_conta_destino, valor, senha } = req.body
    if (!valor || !senha || !numero_conta_origem || !numero_conta_destino) {
        return res.status(401).json({ mensagem: 'O preenchimento de todos os itens é obrigatório!' })
    }

    const contaOrigem = contas.find((conta) => {
        return conta.numeroDaconta == numero_conta_origem
    })
    if (!contaOrigem) {
        return res.status(404).json({ mensagem: 'Conta de origem não encontrada!' })
    }

    const contaDestino = contas.find((conta) => {
        return conta.numeroDaconta == numero_conta_destino
    })
    if (!contaDestino) {
        return res.status(404).json({ mensagem: 'Conta de destino não encontrada!' })
    }

    if (senha != contaOrigem.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' })
    }

    valor = Number(valor)
    saldo = Number(contaOrigem.saldo)

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor informado é inválido!' })
    }

    if (valor > contaOrigem.saldo) {
        return res.status(401).json({ mensagem: 'Saldo insuficiente!' })
    }

    const novoSaldoOrigem = saldo - valor
    contaOrigem.saldo = novoSaldoOrigem

    saldo = Number(contaDestino.saldo)

    const novoSaldoDestino = saldo + valor
    contaDestino.saldo = novoSaldoDestino

    const transferenciaEnviada = {
        "transferenciasEnviadas": [{
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valor
        }]
    }
    transferencias.push(transferenciaEnviada)

    const transferenciaRecebida = {
        "transferenciasRecebidas": [{
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valor
        }]
    }
    transferencias.push(transferenciaRecebida)

    return res.status(204).json()
}

const verSaldo = (req, res) => {

    const { numero_conta, senha } = req.query
    if (!numero_conta || !senha) {
        return res.status(401).json({ mensagem: 'O número da conta e senha são obrigatórios!' })
    }

    const conta = localizarConta(numero_conta)
    
    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' })
    }

    if (senha != conta.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' })
    }
    saldo = conta.saldo
    return res.status(200).json({ saldo })
}

const extrato = (req, res) => {

    const { numero_conta, senha } = req.query
    if (!numero_conta || !senha) {
        return res.status(401).json({ mensagem: 'O número da conta e senha são obrigatórios!' })
    }

    const conta = localizarConta(numero_conta)
  

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' })
    }

    if (senha != conta.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' })
    }

    return res.status(200).json(transacoes)
}
module.exports = {
    listarContas,
    cadastrarConta,
    atualizarConta,
    excluirConta,
    depositar,
    sacar,
    transferir,
    verSaldo,
    extrato
}