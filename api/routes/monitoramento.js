const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

// GET /monitoramento
// será mostrado todos os agricultores com a lista de pendências de cada um

router.get("/", async (req, res) => {
  try {
    const { data: agricultores, error: erroAgricultores } = await supabase
      .from("agricultor")
      .select("cpf_agricultor, nome");

    if (erroAgricultores) {
      console.log("ERRO AO BUSCAR AGRICULTORES:", erroAgricultores);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar agricultores.",
        erro: erroAgricultores.message,
      });
    }

    const { data: pendencias, error: erroPendencias } = await supabase
      .from("pendência")
      .select("id_pendência, id_operação");

    if (erroPendencias) {
      console.log("ERRO AO BUSCAR PENDÊNCIAS:", erroPendencias);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar pendências.",
        erro: erroPendencias.message,
      });
    }

    const { data: operacoes, error: erroOperacoes } = await supabase
      .from("operação")
      .select("id_operação, cpf_agricultor");

    if (erroOperacoes) {
      console.log("ERRO AO BUSCAR OPERAÇÕES:", erroOperacoes);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar operações.",
        erro: erroOperacoes.message,
      });
    }

    const mapaOperacaoParaAgricultor = {};
    operacoes.forEach((operacao) => {
      mapaOperacaoParaAgricultor[operacao.id_operação] =
        operacao.cpf_agricultor;
    });

    const contagemPorAgricultor = {};
    pendencias.forEach((pendencia) => {
      const cpf = mapaOperacaoParaAgricultor[pendencia.id_operação];
      if (!cpf) return;
      contagemPorAgricultor[cpf] = (contagemPorAgricultor[cpf] || 0) + 1;
    });

    const resultado = agricultores.map((agricultor) => ({
      cpf_agricultor: agricultor.cpf_agricultor,
      nome: agricultor.nome,
      pendencias: contagemPorAgricultor[agricultor.cpf_agricultor] || 0,
    }));

    res.json({
      sucesso: true,
      agricultores: resultado,
    });
  } catch (erro) {
    console.log("ERRO INTERNO NO MONITORAMENTO:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// GET /monitoramento/:cpf
// pendencias dos agricultores

router.get("/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;

    const { data: operacoes, error: erroOperacoes } = await supabase
      .from("operação")
      .select("*")
      .eq("cpf_agricultor", cpf)
      .not("id_pendência", "is", null);

    if (erroOperacoes) {
      console.log("ERRO AO BUSCAR OPERAÇÕES DO AGRICULTOR:", erroOperacoes);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar pendências do agricultor.",
        erro: erroOperacoes.message,
      });
    }

    if (!operacoes || operacoes.length === 0) {
      return res.json({
        sucesso: true,
        pendencias: [],
      });
    }

    const idsPendencia = operacoes.map((o) => o.id_pendência);

    const { data: pendencias, error: erroPendencias } = await supabase
      .from("pendência")
      .select("*")
      .in("id_pendência", idsPendencia);

    if (erroPendencias) {
      console.log("ERRO AO BUSCAR PENDÊNCIAS:", erroPendencias);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar pendências.",
        erro: erroPendencias.message,
      });
    }

    const { data: sementes } = await supabase
      .from("semente")
      .select("id_semente, tipo, subtipo");

    const { data: recursos } = await supabase
      .from("recurso")
      .select("id_recurso, nome_recurso");

    const mapaSementes = {};
    (sementes || []).forEach((s) => {
      mapaSementes[s.id_semente] = s;
    });

    const mapaRecursos = {};
    (recursos || []).forEach((r) => {
      mapaRecursos[r.id_recurso] = r;
    });

    const mapaPendencias = {};
    (pendencias || []).forEach((p) => {
      mapaPendencias[p.id_pendência] = p;
    });

    const resultado = operacoes.map((operacao) => {
      const pendencia = mapaPendencias[operacao.id_pendência] || {};
      const semente = operacao.id_semente
        ? mapaSementes[operacao.id_semente]
        : null;
      const recurso = operacao.id_recurso
        ? mapaRecursos[operacao.id_recurso]
        : null;

      return {
        id_operação: operacao.id_operação,
        id_pendência: operacao.id_pendência,
        tipo_operação: operacao.tipo,
        quantidade: operacao.quantidade,
        data_operação: operacao.data_operação,
        tipo: semente ? semente.tipo : recurso ? recurso.nome_recurso : null,
        subtipo: semente ? semente.subtipo : null,
        status_pendencia: pendencia.status || null,
        data_validade: pendencia.data_validade || null,
      };
    });

    resultado.sort(
      (a, b) => new Date(b.data_operação) - new Date(a.data_operação),
    );

    res.json({
      sucesso: true,
      pendencias: resultado,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR PENDÊNCIAS DO AGRICULTOR:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

module.exports = router;
