const express = require("express");
const router = express.Router();

const supabase = require("../supabase");
const verificarAgricultor = require("../middlewares/verificarAgricultor");
const verificarGerente = require("../middlewares/verificarGerente");

// Quantos dias a pendência fica válida depois de ser aprovada (irei alterar o valor, por enqt foi teste)
const DIAS_VALIDADE_PENDENCIA = 30;

// POST /operacoes/doar-semente
// agricultor doa uma semente existindo ou n no banco

router.post("/doar-semente", verificarAgricultor, async (req, res) => {
  try {
    const { tipo, subtipo, quantidade } = req.body;

    console.log("=================================");
    console.log("NOVA DOAÇÃO DE SEMENTE RECEBIDA");
    console.log("Agricultor:", req.agricultor.cpf_agricultor);
    console.log("Tipo:", tipo);
    console.log("Subtipo:", subtipo);
    console.log("Quantidade:", quantidade);
    console.log("=================================");

    if (!tipo || !subtipo || quantidade === undefined) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha todos os campos.",
      });
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade deve ser maior que zero.",
      });
    }

    // Busca pela semente

    let { data: semente, error: erroBusca } = await supabase
      .from("semente")
      .select("*")
      .ilike("tipo", tipo.trim())
      .ilike("subtipo", subtipo.trim())
      .maybeSingle();

    if (erroBusca) {
      console.log("ERRO AO BUSCAR SEMENTE:", erroBusca);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar semente.",
        erro: erroBusca.message,
      });
    }

    if (!semente) {
      const { data: sementeCriada, error: erroCriar } = await supabase
        .from("semente")
        .insert({ tipo, subtipo: subtipo.trim(), quantidade: 0 })
        .select()
        .single();

      if (erroCriar) {
        console.log("ERRO AO CRIAR SEMENTE:", erroCriar);
        return res.status(500).json({
          sucesso: false,
          mensagem: "Erro ao cadastrar o novo tipo de semente.",
          erro: erroCriar.message,
        });
      }

      semente = sementeCriada;
    }

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .insert({
        tipo: "doação",
        status: "pendente",
        cpf_agricultor: req.agricultor.cpf_agricultor,
        id_semente: semente.id_semente,
        quantidade: Number(quantidade),
        data_operação: new Date().toISOString(),
      })
      .select()
      .single();

    if (erroOperacao) {
      console.log("ERRO AO CRIAR OPERAÇÃO:", erroOperacao);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao registrar a doação.",
        erro: erroOperacao.message,
      });
    }

    console.log("DOAÇÃO DE SEMENTE REGISTRADA COM SUCESSO!");

    res.status(201).json({
      sucesso: true,
      mensagem: "Doação enviada! Aguarde a aprovação do gerente.",
      operacao,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO DOAR SEMENTE:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// POST /operacoes/doar-recurso
//agricultor doa um recurso (mesmo pique de sementes)

router.post("/doar-recurso", verificarAgricultor, async (req, res) => {
  try {
    const { nome_recurso, quantidade } = req.body;

    console.log("=================================");
    console.log("NOVA DOAÇÃO DE RECURSO RECEBIDA");
    console.log("Agricultor:", req.agricultor.cpf_agricultor);
    console.log("Nome:", nome_recurso);
    console.log("Quantidade:", quantidade);
    console.log("=================================");

    if (!nome_recurso || quantidade === undefined) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha todos os campos.",
      });
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade deve ser maior que zero.",
      });
    }

    let { data: recurso, error: erroBusca } = await supabase
      .from("recurso")
      .select("*")
      .ilike("nome_recurso", nome_recurso.trim())
      .maybeSingle();

    if (erroBusca) {
      console.log("ERRO AO BUSCAR RECURSO:", erroBusca);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar recurso.",
        erro: erroBusca.message,
      });
    }

    if (!recurso) {
      const { data: recursoCriado, error: erroCriar } = await supabase
        .from("recurso")
        .insert({ nome_recurso: nome_recurso.trim(), quantidade: 0 })
        .select()
        .single();

      if (erroCriar) {
        console.log("ERRO AO CRIAR RECURSO:", erroCriar);
        return res.status(500).json({
          sucesso: false,
          mensagem: "Erro ao cadastrar o novo recurso.",
          erro: erroCriar.message,
        });
      }

      recurso = recursoCriado;
    }

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .insert({
        tipo: "doação",
        status: "pendente",
        cpf_agricultor: req.agricultor.cpf_agricultor,
        id_recurso: recurso.id_recurso,
        quantidade: Number(quantidade),
        data_operação: new Date().toISOString(),
      })
      .select()
      .single();

    if (erroOperacao) {
      console.log("ERRO AO CRIAR OPERAÇÃO:", erroOperacao);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao registrar a doação.",
        erro: erroOperacao.message,
      });
    }

    console.log("DOAÇÃO DE RECURSO REGISTRADA COM SUCESSO!");

    res.status(201).json({
      sucesso: true,
      mensagem: "Doação enviada! Aguarde a aprovação do gerente.",
      operacao,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO DOAR RECURSO:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// POST /operacoes
//solicita

router.post("/", verificarAgricultor, async (req, res) => {
  try {
    const { tipo, id_semente, id_recurso, quantidade } = req.body;

    console.log("=================================");
    console.log("NOVA OPERAÇÃO RECEBIDA");
    console.log("Agricultor:", req.agricultor.cpf_agricultor);
    console.log("Tipo:", tipo);
    console.log("Semente:", id_semente);
    console.log("Recurso:", id_recurso);
    console.log("Quantidade:", quantidade);
    console.log("=================================");

    if ((!id_semente && !id_recurso) || (id_semente && id_recurso)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe uma semente ou um recurso, não os dois.",
      });
    }

    if (!tipo || quantidade === undefined) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha todos os campos.",
      });
    }

    if (tipo !== "solicitação" && tipo !== "doação") {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Tipo inválido. Use 'solicitação' ou 'doação'.",
      });
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade deve ser maior que zero.",
      });
    }

    if (id_semente) {
      const { data: semente, error: erroSemente } = await supabase
        .from("semente")
        .select("*")
        .eq("id_semente", id_semente)
        .maybeSingle();

      if (erroSemente || !semente) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Semente não encontrada.",
        });
      }
    } else {
      const { data: recurso, error: erroRecurso } = await supabase
        .from("recurso")
        .select("*")
        .eq("id_recurso", id_recurso)
        .maybeSingle();

      if (erroRecurso || !recurso) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Recurso não encontrado.",
        });
      }
    }

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .insert({
        tipo,
        status: "pendente",
        cpf_agricultor: req.agricultor.cpf_agricultor,
        id_semente: id_semente ? Number(id_semente) : null,
        id_recurso: id_recurso ? Number(id_recurso) : null,
        quantidade: Number(quantidade),
        data_operação: new Date().toISOString(),
      })
      .select()
      .single();

    if (erroOperacao) {
      console.log("ERRO AO CRIAR OPERAÇÃO:", erroOperacao);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao registrar a operação.",
        erro: erroOperacao.message,
      });
    }

    console.log("OPERAÇÃO CRIADA COM SUCESSO!");

    res.status(201).json({
      sucesso: true,
      mensagem: "Solicitação enviada! Aguarde a aprovação do gerente.",
      operacao,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO CRIAR OPERAÇÃO:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// GET /operacoes/pendentes
// gerente ve as operações

router.get("/pendentes", verificarGerente, async (req, res) => {
  try {
    const { data: operacoes, error: erroOperacoes } = await supabase
      .from("operação")
      .select("*")
      .eq("status", "pendente")
      .order("data_operação", { ascending: true });

    if (erroOperacoes) {
      console.log("ERRO AO BUSCAR OPERAÇÕES:", erroOperacoes);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar operações pendentes.",
        erro: erroOperacoes.message,
      });
    }

    // Busca os dados extras (nome, telefone, semente e recurso)
    const { data: agricultores } = await supabase
      .from("agricultor")
      .select("cpf_agricultor, nome, telefone");

    const { data: sementes } = await supabase
      .from("semente")
      .select("id_semente, tipo, subtipo, quantidade");

    const { data: recursos } = await supabase
      .from("recurso")
      .select("id_recurso, nome_recurso, quantidade");

    const mapaAgricultores = {};
    (agricultores || []).forEach((a) => {
      mapaAgricultores[a.cpf_agricultor] = {
        nome: a.nome,
        telefone: a.telefone,
      };
    });

    const mapaSementes = {};
    (sementes || []).forEach((s) => {
      mapaSementes[s.id_semente] = s;
    });

    const mapaRecursos = {};
    (recursos || []).forEach((r) => {
      mapaRecursos[r.id_recurso] = r;
    });

    const resultado = operacoes.map((operacao) => {
      const agricultorInfo = mapaAgricultores[operacao.cpf_agricultor] || {};

      return {
        id_operação: operacao.id_operação,
        tipo: operacao.tipo,
        quantidade: operacao.quantidade,
        data_operação: operacao.data_operação,
        cpf_agricultor: operacao.cpf_agricultor,
        nome_agricultor: agricultorInfo.nome || "Desconhecido",
        telefone_agricultor: agricultorInfo.telefone || null,
        semente: operacao.id_semente
          ? mapaSementes[operacao.id_semente] || null
          : null,
        recurso: operacao.id_recurso
          ? mapaRecursos[operacao.id_recurso] || null
          : null,
      };
    });

    res.json({
      sucesso: true,
      operacoes: resultado,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR PENDENTES:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// PUT /operacoes/:id/aprovar
// doação n gera pendência

router.put("/:id/aprovar", verificarGerente, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .select("*")
      .eq("id_operação", id)
      .maybeSingle();

    if (erroOperacao || !operacao) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Operação não encontrada.",
      });
    }

    if (operacao.status !== "pendente") {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Essa operação já foi analisada.",
      });
    }

    const tabela = operacao.id_semente ? "semente" : "recurso";
    const colunaId = operacao.id_semente ? "id_semente" : "id_recurso";
    const idItem = operacao.id_semente || operacao.id_recurso;

    const { data: item, error: erroItem } = await supabase
      .from(tabela)
      .select("*")
      .eq(colunaId, idItem)
      .maybeSingle();

    if (erroItem || !item) {
      return res.status(404).json({
        sucesso: false,
        mensagem: `${tabela === "semente" ? "Semente" : "Recurso"} da operação não foi encontrado(a).`,
      });
    }

    let novaQuantidade;

    if (operacao.tipo === "solicitação") {
      if (item.quantidade < operacao.quantidade) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Estoque insuficiente para aprovar essa solicitação.",
        });
      }
      novaQuantidade = item.quantidade - operacao.quantidade;
    } else {
      novaQuantidade = item.quantidade + operacao.quantidade;
    }

    const { error: erroAtualizarItem } = await supabase
      .from(tabela)
      .update({ quantidade: novaQuantidade })
      .eq(colunaId, idItem);

    if (erroAtualizarItem) {
      console.log("ERRO AO ATUALIZAR ESTOQUE:", erroAtualizarItem);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar o estoque.",
        erro: erroAtualizarItem.message,
      });
    }

    // Só cria pendência se for solicitação
    let pendencia = null;

    if (operacao.tipo === "solicitação") {
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + DIAS_VALIDADE_PENDENCIA);

      const { data: pendenciaCriada, error: erroPendencia } = await supabase
        .from("pendência")
        .insert({
          id_operação: operacao.id_operação,
          status: "ativa",
          data_validade: dataValidade.toISOString(),
        })
        .select()
        .single();

      if (erroPendencia) {
        console.log("ERRO AO CRIAR PENDÊNCIA:", erroPendencia);
        return res.status(500).json({
          sucesso: false,
          mensagem: "Erro ao gerar a pendência.",
          erro: erroPendencia.message,
        });
      }

      pendencia = pendenciaCriada;
    }

    const { error: erroAtualizarOperacao } = await supabase
      .from("operação")
      .update({
        status: "aprovada",
        cpf_gerente: req.gerente.cpf_gerente,
        id_pendência: pendencia ? pendencia.id_pendência : null,
      })
      .eq("id_operação", operacao.id_operação);

    if (erroAtualizarOperacao) {
      console.log("ERRO AO ATUALIZAR OPERAÇÃO:", erroAtualizarOperacao);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar a operação.",
        erro: erroAtualizarOperacao.message,
      });
    }

    console.log(
      pendencia
        ? "OPERAÇÃO APROVADA E PENDÊNCIA CRIADA COM SUCESSO!"
        : "DOAÇÃO APROVADA COM SUCESSO!",
    );

    res.json({
      sucesso: true,
      mensagem: pendencia
        ? "Operação aprovada e pendência criada."
        : "Doação aprovada com sucesso.",
      pendencia,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO APROVAR:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// PUT /operacoes/:id/recusar

router.put("/:id/recusar", verificarGerente, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: operacao, error: erroOperacao } = await supabase
      .from("operação")
      .select("*")
      .eq("id_operação", id)
      .maybeSingle();

    if (erroOperacao || !operacao) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Operação não encontrada.",
      });
    }

    if (operacao.status !== "pendente") {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Essa operação já foi analisada.",
      });
    }

    const { error: erroAtualizar } = await supabase
      .from("operação")
      .update({
        status: "recusada",
        cpf_gerente: req.gerente.cpf_gerente,
      })
      .eq("id_operação", id);

    if (erroAtualizar) {
      console.log("ERRO AO RECUSAR OPERAÇÃO:", erroAtualizar);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao recusar a operação.",
        erro: erroAtualizar.message,
      });
    }

    console.log("OPERAÇÃO RECUSADA!");

    res.json({
      sucesso: true,
      mensagem: "Operação recusada.",
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO RECUSAR:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

module.exports = router;
