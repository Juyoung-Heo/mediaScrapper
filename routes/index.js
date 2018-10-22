const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const fs = require('fs');
const mysql = require('promise-mysql');
const parser = require('../parser/init');

let judyConn;

const dbCon = async () => {
  judyConn = await mysql.createConnection({
    host: '52.78.97.180',
    user: 'root',
    password: 'ciziondb*0707!',
    database: 'judy'
  });
}

try {
  dbCon();
} catch (err) {
  console.error(err);
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

//select
router.get('/api/refer', async (req, res) => {
  const refer = req.query.refer.replace('https://', '').replace('http://', '');
  const mappingkey_select = `select * from referrer_info where referrer = '${refer}'`;
  const defineRefer = refer.startsWith('http') ? refer : 'http://' + refer;
  const getmodule = getModuleName(refer);
  const mappingkey_result = await judyConn.query(mappingkey_select);
  const lastId_select = `select * from referrer_info order by id desc limit 1`;
  let lastId_result = await judyConn.query(lastId_select);
  const newId = parseInt(lastId_result[0].id) + 1;
  mappingkey = base62.encode(newId);

  const media = getmodule;
  const news = new parser[media](defineRefer);

  if (mappingkey_result.length > 0) {
    console.log(mappingkey_result[0].mappingkey);
    mappingkey = mappingkey_result[0].mappingkey;
    res.send(mappingkey);
  } else {
    await news.crawling(defineRefer);
    await news.setInsertSql(mappingkey);
    const sql_insert = await news.InsertSql;
    // await judyConn.query(sql_insert, function (err, result) {
    //   if (err) throw err;
    //   console.log("1 record inserted");
    // });
    res.end();
  }

  // mappingkey = mappingkey_result[0].mappingkey;
  // res.send(mappingkey);
});

const getModuleFile = JSON.parse(fs.readFileSync('./scrapper/media.json', {encoding: 'utf-8'}));
const getModuleName = function(refer){
  return getModuleFile.find(module => refer.indexOf(module.domain) !== -1);
}
let mappingkey;
const base62 = {
  charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split(''),
  encode: integer => {
    if (integer === 0) {
      return 0;
    }
    let s = [];
    while (integer > 0) {
      s = [base62.charset[integer % 62], ...s];
      integer = Math.floor(integer / 62);
    }
    return s.join('');
  },
  decode: chars => chars.split('').reverse().reduce((prev, curr, i) =>
    prev + (base62.charset.indexOf(curr) * (62 ** i)), 0)
};

module.exports = router;
