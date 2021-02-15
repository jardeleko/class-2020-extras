let conn;
let i = 0;
var tmp; 

async function runTransaction() {
  connect();
  await createTable();
  //await rollback_called();
  //await one_tuple();
  //await two_tuples();
  //await execute(); // comando com insert explícito
  await execute_implicit(); // comando com tempos implicitos de inserção   
  await showRows();
  // await showRows_atl();
}

//Generate random string to client name
function getRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    let length = 9;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//Generate random number to client id, cpf, saldoemconta
function getRandomNumber() {
  let result = '';
  let length = 9;
  for ( var i = 0; i < length; i++ ) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

//Connect to database with postgres user and pass
function connect() {
    const { Client } = require('pg');
    conn = new Client({
        host: 'localhost',
        database: 'transaction_db',
        user: 'postgres',
        password: '1234',
        port: 5432,
  });
  conn.connect();
}

//Create table after connect
async function createTable() {
    await conn.query(`
        drop table if exists clientes;
        create table if not exists clientes(
            id integer not null,
            nome varchar,
            cpf integer, 
            dataNascimento date,
            saldoEmConta integer,
            primary key (id)
        )
    `);
  console.log('Table created in postgresql');
}

//Execute implicit
async function execute_implicit(){
  today = new Date();
  while (i < 20000) {
    try {
        const sqlString = `INSERT INTO clientes (id, nome, cpf, datanascimento, saldoemconta) VALUES ($1, $2, $3, $4, $5);`;
        const values = [getRandomNumber(), getRandomString(), getRandomNumber(), '2020-11-11', getRandomNumber()];

        //Pass sql string to the query method
        await conn.query(sqlString, values, function(err, result) {
        console.log("client.query() SQL result:", result);
        if (err) {
            console.log("\nclient.query():", err);
        } 
      });
    } catch (er) {
      // Rollback before executing another transaction
      console.log("client.query():", er);
    }
    i++
  }
}

async function one_tuple(){ //exercicio 1, insere somente uma tupla
  try {
    today = new Date();
      
      await conn.query("BEGIN"); //begin transaction 
    try{
      const sqlString = `INSERT INTO clientes(id, nome, cpf, datanascimento, saldoemconta) VALUES($1, $2, $3, $4, $5);`;
      const values = [3, 'Maggie', 42, '2013-10-10', 5800];
      await conn.query(sqlString, values, function(err, result){
        console.log("client.query() SQL result:", result);
        
        if(err){
          console.log("\nclient.query():", err);
          conn.query("ROLLBACK");
          console.log("Transaction ROLLBACK called");
        }
        else{
          conn.query("COMMIT");
          console.log("client.query() COMMIT row count:", result.rowCount);        
        }
      });

    } catch(err){
      conn.query("ROLLBACK");
      console.log("client.query();", err);
      console.log("Transaction ROLLBACK called");
    }

  } finally {
    console.log("Client is released");
  }
  
}

async function two_tuples(){  //criando uma função para inserir 2 linhas
  try{
    today = new Date();
    await conn.query("BEGIN");
    
    try{
      await conn.query(`INSERT INTO clientes (id, nome, cpf, datanascimento, saldoemconta)
                        VALUES(1, 'Paul McCartney', 123412, '2021-12-12', 40000),
                              (2, 'John Lennon', 432143, '2020-11-11', 38000);`, function(err, result){
        
        if(err){
          console.log("\n client.query();", err);
          conn.query("ROLLBACK");
          console.log("Transaction ROLLBACK called");    
        }     
        else{
          conn.query("COMMIT");
          console.log("client.query() COMMIT row count", result.rowCount);
        }
      });
    }catch(err){
      conn.query("ROLLBACK");
      console.log("client.query():", err);
      console.log("Transaction ROLLBACK called");
    }
  }finally{
    console.log("Client is released");
  }
}

async function rollback_called(){ //rollback na movimentação entre 2 contas 
  try {
    today = new Date();
    await conn.query("BEGIN");

    try{
      await conn.query(`UPDATE clientes SET saldoemconta = 20000 WHERE id = 1;
                        UPDATE clientes SET saldoemconta = 58000 WHERE id = 2;`, function(err, result){
        
        if(err){
          console.log("\nclient.query():", err);
          conn.query("ROLLBACK;");
          console.log("Transaction ROLLBACK called");
        }
        else {
          console.log("Transaction ROLLBACK called");
          conn.query("ROLLBACK;"); //forçando ROLLBACK
        }                  
      });
    }catch(err){
      conn.query("ROLLBACK;");
      console.log("client.query():", err);
      console.log("Transaction ROLLBACK called");
    }
  }
  finally{
    console.log("Client is released");
  }
}

//Execute explicit
async function execute(){
  //await conn.query('\SET AUTOCOMMIT = 0');  
  try {
    today = new Date();
      //Init the postgres transaction
      await conn.query("BEGIN");
      //Insert 100k tuples
      while (i < 20000) {
          let id = getRandomNumber();
          let nome = getRandomString();
          let cpf = getRandomNumber();
          let datanascimento = "2020-11-11"
          let saldoemconta = getRandomNumber();
  
          try {
              //Declare string for sql statement
              const sqlString = `INSERT INTO clientes (id, nome, cpf, datanascimento, saldoemconta) VALUES ($1, $2, $3, $4, $5);`;
              const values = [id, nome, cpf, datanascimento, saldoemconta];
      
              //Pass sql string to the query method
              await conn.query(sqlString, values, function(err, result) {
              console.log("client.query() SQL result:", result);
      
              if (err) {
                  console.log("\nclient.query():", err);
        
                  //Rollback before executing another transaction
                  conn.query("ROLLBACK");
                  console.log("Transaction ROLLBACK called");
              } else {
                  conn.query("COMMIT");
                  console.log("client.query() COMMIT row count:", result.rowCount);
              }
          });
          } catch (er) {
            //Rollback before executing another transaction
            conn.query("ROLLBACK");
            console.log("client.query():", er);
            console.log("Transaction ROLLBACK called");
          }
          i++
      }
  } finally {
      console.log("Client is released");
    }
}

//Print all rows in console
async function showRows() {
  let n = 0;
  let { rows } = await conn.query(`select * from clientes`);
  for (const row of rows) {
    console.log(row);
    n++;
  }
  tmp = (new Date() - today);
  console.log("\nWas inserted " + n + " rows in " + tmp + " ms(t)");
  //Kill process in node, go back terminal
  process.exit();
}
async function showRows_atl() {
  //let n = 0;
  let { rows } = await conn.query(`select * from clientes`);
  for (const row of rows) {
    console.log(row);
//    n++;
  }
  //tmp = (new Date() - today);
 // console.log("\nWas inserted " + n + " rows in " + tmp + " ms(t)");
  //Kill process in node, go back terminal
  //process.exit();
}

runTransaction();
//runTransaction_imp();