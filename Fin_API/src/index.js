const express = require("express");
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(express.json())

const customers = []

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

// Middleware
function verifyExistsAccountCPF(req, resp, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return resp.status(400).json({ error: "Customer not found." })
  }

  req.customer = customer;

  return next();
}

app.post("/account", (req, resp) => {
  const { cpf, name } = req.body;

  const custumersAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (custumersAlreadyExists) {
    return resp.status(400).json({ Error: "Customer already exists." })
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
});

app.post("/deposit", verifyExistsAccountCPF, (req, resp) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOpration = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOpration);

  return resp.status(201).send();
});

app.post("/withdraw", verifyExistsAccountCPF, (req, resp) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);
  
  if(balance < amount) {
    return resp.status(400).json({ error: "Insulfficient funds." })
  }

  const statementOpration = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOpration);

  return resp.status(201).send();

});

app.get("/statement/date", verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00")

  const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

  return resp.status(200).json(statement);
});

app.put("/account", verifyExistsAccountCPF, (req, resp) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return resp.status(201).send();
});

app.get("/account", verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req;

  return resp.json(customer);
});

app.delete("/account", verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return resp.status(204).send();
});

app.get("/balance", verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req;

  const balance = getBalance(customer.statement);
  
  return resp.json(balance);
});

app.listen(3333, () => console.log("Servidor rodando"));