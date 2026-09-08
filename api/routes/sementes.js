const express = require("express");
const router = express.Router();

const supabase = require("../supabase");
const verificarGerente = require("../middlewares/verificarGerente");

// GET /sementes

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("semente")
      .select("*")
      .order("tipo", { ascending: true });

    console.log("=================================");
    console.log("BUSCA DE SEMENTES");
    console.log("DATA:", data);
    console.log("ERRO:", error);
    console.log("=================================");

    if (error) {
      console.log("ERRO AO BUSCAR SEMENTES:", error);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar sementes.",
        erro: error.message,
      });
    }

    res.json({
      sucesso: true,
      sementes: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR SEMENTES:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// POST /sementes
// adiciona uma nova semente (só gerente pode fazer isso)

router.post("/", verificarGerente, async (req, res) => {
  try {
    const { tipo, subtipo, quantidade } = req.body;

    console.log("=================================");
    console.log("NOVA SEMENTE RECEBIDA");
    console.log("Gerente:", req.gerente.email);
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

    if (isNaN(quantidade) || quantidade < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade deve ser um número maior ou igual a zero.",
      });
    }

    // Verifica se já existe uma semente com esse tipo/subtipo

    const { data: existente, error: erroExistente } = await supabase
      .from("semente")
      .select("*")
      .ilike("tipo", tipo.trim())
      .ilike("subtipo", subtipo.trim())
      .maybeSingle();

    if (erroExistente) {
      console.log("ERRO AO VERIFICAR SEMENTE EXISTENTE:", erroExistente);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao verificar sementes existentes.",
        erro: erroExistente.message,
      });
    }

    if (existente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: `Já existe uma semente cadastrada com esse tipo e subtipo ("${existente.tipo} - ${existente.subtipo}"). Edite a quantidade dela em vez de criar uma nova.`,
      });
    }

    const { data, error } = await supabase
      .from("semente")
      .insert({
        tipo: tipo.trim(),
        subtipo: subtipo.trim(),
        quantidade: Number(quantidade),
      })
      .select()
      .single();

    if (error) {
      console.log("ERRO AO ADICIONAR SEMENTE:", error);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao adicionar semente.",
        erro: error.message,
      });
    }

    console.log("SEMENTE ADICIONADA COM SUCESSO!");

    res.status(201).json({
      sucesso: true,
      mensagem: "Semente adicionada com sucesso!",
      semente: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO ADICIONAR SEMENTE:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// PUT /sementes/:id
//editar uma semente

router.put("/:id", verificarGerente, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, subtipo, quantidade } = req.body;

    console.log("=================================");
    console.log("EDITANDO SEMENTE");
    console.log("ID:", id);
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

    if (isNaN(quantidade) || quantidade < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "A quantidade deve ser um número maior ou igual a zero.",
      });
    }

    const { data: existente, error: erroExistente } = await supabase
      .from("semente")
      .select("*")
      .ilike("tipo", tipo.trim())
      .ilike("subtipo", subtipo.trim())
      .neq("id_semente", id)
      .maybeSingle();

    if (erroExistente) {
      console.log("ERRO AO VERIFICAR SEMENTE EXISTENTE:", erroExistente);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao verificar sementes existentes.",
        erro: erroExistente.message,
      });
    }

    if (existente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: `Já existe outra semente cadastrada com esse tipo e subtipo ("${existente.tipo} - ${existente.subtipo}").`,
      });
    }

    const { data, error } = await supabase
      .from("semente")
      .update({
        tipo: tipo.trim(),
        subtipo: subtipo.trim(),
        quantidade: Number(quantidade),
      })
      .eq("id_semente", id)
      .select()
      .single();

    if (error) {
      console.log("ERRO AO EDITAR SEMENTE:", error);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao editar semente.",
        erro: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Semente não encontrada.",
      });
    }

    console.log("SEMENTE EDITADA COM SUCESSO!");

    res.json({
      sucesso: true,
      mensagem: "Semente editada com sucesso!",
      semente: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EDITAR SEMENTE:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// DELETE /sementes/:id
// excluir semente

router.delete("/:id", verificarGerente, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=================================");
    console.log("EXCLUINDO SEMENTE");
    console.log("ID:", id);
    console.log("=================================");

    const { data, error } = await supabase
      .from("semente")
      .delete()
      .eq("id_semente", id)
      .select();

    if (error) {
      console.log("ERRO AO EXCLUIR SEMENTE:", error);

      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir semente.",
        erro: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Semente não encontrada.",
      });
    }

    console.log("SEMENTE EXCLUÍDA COM SUCESSO!");

    res.json({
      sucesso: true,
      mensagem: "Semente excluída com sucesso!",
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EXCLUIR SEMENTE:", erro);

    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

module.exports = router;
