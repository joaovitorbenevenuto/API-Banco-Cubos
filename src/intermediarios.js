
const { contas } = require('./bancodedados')


const validarSenha = (req, res, next) => {

    const { senha_banco } = req.query

    if (!senha_banco) {
        return res.status(401).json({ mensagem: 'A senha é obrigatória' })
    }

    if (senha_banco != "Cubos123Bank") {
        return res.status(401).json({ mensagem: 'A senha do banco informada é inválida!' })
    }
    next()
}

const verificarItens = (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(401).json({ mensagem: 'O preenchimento de todos os itens é obrigatório!' })
    }

    next()
}

const verificarCPFeEmail = (req, res, next) => {

    let { cpf, email } = req.body


    cpf = unificarCPF(cpf)
    email = unificarEmail(email)

    const verificarCpf = contas.find((verificador) => {
        return verificador.cpf == cpf
    })
    if (verificarCpf) {
        return res.status(401).json({ mensagem: 'O cpf já existe!' })
    }

    const verificarEmail = contas.find((verificador) => {
        return verificador.email == email
    })
    if (verificarEmail) {
        return res.status(401).json({ mensagem: 'O email já existe!' })
    }

    next()
}

const unificarCPF = (cpf) => {
    return cpf = cpf.split(" ").join("")
}

const unificarEmail = (email) => {
    return email = email.split(" ").join("")
}

const localizarConta = (id) => {
    const conta = contas.find((conta) => {
        return conta.numeroDaconta == Number(id)
    })
    return conta
}

module.exports = {
    validarSenha,
    verificarItens,
    verificarCPFeEmail,
    unificarCPF,
    unificarEmail,
    localizarConta
}