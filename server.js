const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Config SQL Server
const dbconfig = {
    user: "sa",
    password: "uscs",
    server: "localhost",
    database: "CRUD",
    options: {
        encrypt: false,
        enableArithAbort: true,
    },
};

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rotas
// Listar todos os produtos
app.get("/products", async (req, res) => {
    try {
        const pool = await sql.connect(dbconfig);
        const result = await pool.request().query("SELECT * FROM Products");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Adicionar produto
app.post("/products", async (req, res) => {
    try {
        const { name, price, description } = req.body;
        
        // Verifique se os campos foram preenchidos corretamente
        if (!name || !price || !description) {
            return res.status(400).send("Missing required fields");
        }

        const pool = await sql.connect(dbconfig);
        const result = await pool.request()
            .input("Name", sql.NVarChar, name)
            .input("Price", sql.Decimal(10, 2), price)
            .input("Description", sql.NVarChar, description)
            .query(
                "INSERT INTO Products (Name, Price, Description) OUTPUT Inserted.Id, Inserted.Name, Inserted.Price, Inserted.Description VALUES (@Name, @Price, @Description)"
            );

        // Envia o produto inserido como resposta
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// Deletar produto
app.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbconfig);
        await pool.request()
            .input("Id", sql.Int, id)
            .query("DELETE FROM Products WHERE Id = @Id");
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
