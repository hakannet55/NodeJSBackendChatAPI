// db.js
const sqlite3 = require('sqlite3').verbose();  // SQLite3 modülünü içe aktar

// Veritabanını in-memory olarak başlatıyoruz
// const db = new sqlite3.Database(':memory:');
const { Pool } = require('pg');
const bcrypt = require("bcryptjs");

const db = new Pool({
  connectionString: process.env.DATABASE_URL, // Render'dan aldığınız tam bağlantı URL'si
  ssl: { rejectUnauthorized: false }, // SSL gerektiği durumlar için
});
const prefix="prodductsApp";

const tabNameEnums = {
  tbl_products: 'tbl_products',
  tbl_users: 'tbl_users',
  tbl_messages: 'tbl_messages',
  tbl_stores: 'tbl_stores',
  tbl_prod_users: 'tbl_prod_users'
};
// Tabloları oluştur

function tableExists(tabname) {
  return db.query(`SELECT * FROM information_schema.tables WHERE table_name = $1`, [tabname]);
}

async function createTable() {
  try {
    const e=tabNameEnums;
    const create_tbl_users=`
      CREATE TABLE IF NOT EXISTS ${e.tbl_users} (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `;
    const tbl_prod_users=`
      CREATE TABLE IF NOT EXISTS ${e.tbl_prod_users} (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            account TEXT NOT NULL,
            password TEXT NOT NULL
      );
    `;

    const create_tbl_messages=`CREATE TABLE IF NOT EXISTS ${e.tbl_messages} (
          id SERIAL PRIMARY KEY,
          userId INTEGER NOT NULL,
          message TEXT NOT NULL,
          senderId TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES tbl_users(id));`;

    const create_tbl_products=`
    CREATE TABLE IF NOT EXISTS ${tabNameEnums.tbl_products} (
      id SERIAL PRIMARY KEY,
      target TEXT NOT NULL,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL
    );
  `;
    const create_tbl_stores=`
    CREATE TABLE IF NOT EXISTS ${tabNameEnums.tbl_stores} (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL
    );
  `;
    let inserts=[];
    const exist=await tableExists(tabNameEnums.tbl_prod_users);
    if(exist.rowCount==0){
      const hashedPassword = bcrypt.hashSync("55", 10);
      const insertUserRootSql=`INSERT INTO ${tabNameEnums.tbl_prod_users} (account,username,password) VALUES ('nelly','root','${hashedPassword}');`;
      inserts.push(insertUserRootSql);
    }

    for (const query1 of [
      create_tbl_users,
      create_tbl_messages,
      create_tbl_products,
      create_tbl_stores,tbl_prod_users
    ]) {
      await db.query(query1);
    }
    if(inserts.length>0){
      for (const query1 of inserts) {
        await db.query(query1);
      }
    }

  } catch (error) {
    console.error('tbl_products tablosu oluşturulurken hata:', error);
  }
}


// Veritabanı bağlantısı ve tabloları oluşturma
createTable().then(r => {

});


// getData
const getData = (tabNameEnums,multipleResponse=true,where="") => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM ${tabNameEnums} ${where}`, (err, rows) => {
      if (err) reject(err);
      if(multipleResponse){
        resolve(rows);
      }else{
        resolve(rows[0]);
      }
    });
  });
}
// setData
const setData = (tabNameEnums,data) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO ${tabNameEnums} SET ?`, data, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}
// removeData
const removeData = (tabNameEnums,id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM ${tabNameEnums} WHERE id = ?`, id, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

const sqlInjectFilterObject = (obj) => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, sqlInjectFilter(value)]));
}

const sqlInjectFilter = (str) => {
  return str.replace(/[^a-zA-Z0-9]/g, '').trim();
}

module.exports = { db,tabNameEnums,getData,setData,removeData,sqlInjectFilterObject,prefix };
