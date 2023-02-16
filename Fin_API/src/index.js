const express = require("express");
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(express.json())

const customers = []

// Middleware
function verifyExistsAccountCPF(req, resp, next){
  const {cpf} = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if(!customer){
    return resp.status(400).json({error: "Customer not found."})
  }

  req.customer = customer;

  return next();
}

app.post("/account", (req, resp) => {
  const { cpf, name } = req.body;

  const custumersAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (custumersAlreadyExists){
    return resp.status(400).json({Error: "Customer already exists."})
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  });

  return resp.status(201).send()

 
});

app.get("/statement", verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req;

  return resp.status(200).json(customer.statement);
})
 
app.listen(3333, () => console.log("Servidor rodando"));