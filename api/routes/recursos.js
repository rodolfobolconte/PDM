const express = require("express");
const router = express.Router();

const supabase = require("../supabase");
const verificarGerente = require("../middlewares/verificarGerente");

// GET /recursos

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("recurso")
      .select("*")
      .order("nome_recurso", { ascending: true });

    if (error) {
      console.log("ERRO AO BUSCAR RECURSOS:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar recursos.",
        erro: error.message,
      });
    }

    res.json({
      sucesso: true,
      recursos: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO BUSCAR RECURSOS:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// POST /recursos

router.post("/", verificarGerente, async (req, res) => {
  try {
    const { nome_recurso, quantidade } = req.body;

    if (!nome_recurso || quantidade === undefined) {
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
      .from("recurso")
      .select("*")
      .ilike("nome_recurso", nome_recurso.trim())
      .maybeSingle();

    if (erroExistente) {
      console.log("ERRO AO VERIFICAR RECURSO EXISTENTE:", erroExistente);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao verificar recursos existentes.",
        erro: erroExistente.message,
      });
    }

    if (existente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: `Já existe um recurso cadastrado com esse nome ("${existente.nome_recurso}"). Edite a quantidade dele em vez de criar um novo.`,
      });
    }

    const { data, error } = await supabase
      .from("recurso")
      .insert({
        nome_recurso: nome_recurso.trim(),
        quantidade: Number(quantidade),
      })
      .select()
      .single();

    if (error) {
      console.log("ERRO AO ADICIONAR RECURSO:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao adicionar recurso.",
        erro: error.message,
      });
    }

    res.status(201).json({
      sucesso: true,
      mensagem: "Recurso adicionado com sucesso!",
      recurso: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO ADICIONAR RECURSO:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

// PUT /recursos/:id

router.put("/:id", verificarGerente, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_recurso, quantidade } = req.body;

    if (!nome_recurso || quantidade === undefined) {
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
      .from("recurso")
      .select("*")
      .ilike("nome_recurso", nome_recurso.trim())
      .neq("id_recurso", id)
      .maybeSingle();

    if (erroExistente) {
      console.log("ERRO AO VERIFICAR RECURSO EXISTENTE:", erroExistente);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao verificar recursos existentes.",
        erro: erroExistente.message,
      });
    }

    if (existente) {
      return res.status(409).json({
        sucesso: false,
        mensagem: `Já existe outro recurso cadastrado com esse nome ("${existente.nome_recurso}").`,
      });
    }

    const { data, error } = await supabase
      .from("recurso")
      .update({
        nome_recurso: nome_recurso.trim(),
        quantidade: Number(quantidade),
      })
      .eq("id_recurso", id)
      .select()
      .single();

    if (error) {
      console.log("ERRO AO EDITAR RECURSO:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao editar recurso.",
        erro: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Recurso não encontrado.",
      });
    }

    res.json({
      sucesso: true,
      mensagem: "Recurso editado com sucesso!",
      recurso: data,
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EDITAR RECURSO:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

router.delete("/:id", verificarGerente, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("recurso")
      .delete()
      .eq("id_recurso", id)
      .select();

    if (error) {
      console.log("ERRO AO EXCLUIR RECURSO:", error);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir recurso.",
        erro: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Recurso não encontrado.",
      });
    }

    res.json({
      sucesso: true,
      mensagem: "Recurso excluído com sucesso!",
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EXCLUIR RECURSO:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

module.exports = router;
