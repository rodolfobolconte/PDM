const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

// DELETE /pendencias/:id

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: pendencia, error: erroBusca } = await supabase
      .from("pendência")
      .select("*")
      .eq("id_pendência", id)
      .maybeSingle();

    if (erroBusca || !pendencia) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Pendência não encontrada.",
      });
    }

    const { error: erroOperacao } = await supabase
      .from("operação")
      .update({ id_pendência: null })
      .eq("id_pendência", id);

    if (erroOperacao) {
      console.log("ERRO AO DESVINCULAR OPERAÇÃO:", erroOperacao);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar a operação.",
        erro: erroOperacao.message,
      });
    }

    const { error: erroExcluir } = await supabase
      .from("pendência")
      .delete()
      .eq("id_pendência", id);

    if (erroExcluir) {
      console.log("ERRO AO EXCLUIR PENDÊNCIA:", erroExcluir);
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao excluir a pendência.",
        erro: erroExcluir.message,
      });
    }

    console.log("PENDÊNCIA EXCLUÍDA COM SUCESSO!");

    res.json({
      sucesso: true,
      mensagem: "Pendência excluída.",
    });
  } catch (erro) {
    console.log("ERRO INTERNO AO EXCLUIR PENDÊNCIA:", erro);
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor.",
      erro: erro.message,
    });
  }
});

module.exports = router;
