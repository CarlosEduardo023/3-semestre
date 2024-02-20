const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "professores"
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conexão ao banco de dados MySQL estabelecida!");
  }
});

// Rota para listar todos os professores
app.get("/professores", (req, res) => {
  connection.query("SELECT * FROM professores", (err, results) => {
    if (err) {
      res.status(500).json({ message: "Erro ao buscar professores no banco de dados" });
    } else {
      res.json(results);
    }
  });
});

// Rota para buscar um professor por ID
app.get("/professores/:id", (req, res) => {
  const id = req.params.id;
  connection.query("SELECT * FROM professores WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Erro ao buscar o professor no banco de dados" });
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ message: "Professor não encontrado" });
      }
    }
  });
});

// Rota para adicionar um novo professor
app.post("/professores", (req, res) => {
  const { Nome, email, CPF, Materia_lecionada, Telefone } = req.body;
  const insertQuery = "INSERT INTO professores (Nome, email, CPF, Materia_lecionada, Telefone) VALUES (?, ?, ?, ?, ?)";
  connection.query(insertQuery, [Nome, email, CPF, Materia_lecionada, Telefone], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Erro ao adicionar um novo professor" });
    } else {
      res.status(201).json({ id: result.insertId, ...req.body });
    }
  });
});

// Rota para atualizar um professor
app.put("/professores/:professor_id", (req, res) => {
  const professor_id = parseInt(req.params.professor_id);
  const updatedProfessor = req.body;

  if (Object.keys(updatedProfessor).length === 0) {
    return res.status(400).json({ message: "Nenhum campo enviado para atualização" });
  }

  const fieldsToUpdate = Object.keys(updatedProfessor);
  const valuesToUpdate = Object.values(updatedProfessor);

  let updateQuery = "UPDATE professores SET ";
  fieldsToUpdate.forEach((field, index) => {
    updateQuery += `${field} = ?`;
    if (index !== fieldsToUpdate.length - 1) {
      updateQuery += ", ";
    }
  });
  updateQuery += " WHERE id = ?";

  valuesToUpdate.push(professor_id);

  connection.query(
    updateQuery,
    valuesToUpdate,
    (err, result) => {
      if (err) {
        console.error("Erro ao atualizar dados no MySQL: " + err);
        res.status(500).json({ message: "Erro ao atualizar o professor" });
      } else {
        if (result.affectedRows > 0) {
          res.json({ id: professor_id, updatedFields: fieldsToUpdate });
        } else {
          res.status(404).json({ message: "Professor não encontrado" });
        }
      }
    }
  );
});  
  
// Rota para remover um professor
app.delete("/professores/:id", (req, res) => {
  const id = req.params.id;
  const deleteQuery = "DELETE FROM professores WHERE id = ?";
  connection.query(deleteQuery, [id], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Erro ao remover o professor" });
    } else {
      if (result.affectedRows > 0) {
        res.json({ message: "Professor removido com sucesso" });
      } else {
        res.status(404).json({ message: "Professor não encontrado" });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});