// Importa o dotenv
const dotenv = require("dotenv");

// Importa o path para localizar o .env
const path = require("path");

// Importa o Supabase
const { createClient } = require("@supabase/supabase-js");

// .env

dotenv.config({
  path: path.join(__dirname, ".env"),
});

// informações do .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// caso n sejam válidas

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_KEY não foi encontrado.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Exporta a conexão para o server.js
module.exports = supabase;
