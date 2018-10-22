const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());
const Iconv = require('iconv').Iconv;

const fs = require('fs');
const cheerio = require('cheerio');
const mysql = require('promise-mysql');
const request = require('request');
const async = require('async');
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
  parsingInfo = getParsingInfo(refer);
  const mappingkey_result = await judyConn.query(mappingkey_select);
  const lastId_select = `select * from referrer_info order by id desc limit 1`;
  let lastId_result = await judyConn.query(lastId_select);
  const newId = parseInt(lastId_result[0].id) + 1;
  mappingkey = base62.encode(newId);

  const press = "Mk";
  const news = new parser[press](defineRefer);

  if (mappingkey_result.length > 0) {
    console.log(mappingkey_result[0].mappingkey);
    mappingkey = mappingkey_result[0].mappingkey;
    res.send(mappingkey);
  } else {
    news.crawling(defineRefer);
    news.setInsertSql(mappingkey)
      .then(function() {
        console.log(news.InsertSql);
      })
      .catch(function(err){
        console.log(err.message);
      })
    res.end();
  }

  // mappingkey = mappingkey_result[0].mappingkey;
  // res.send(mappingkey);
});

const parsingInfoFile = JSON.parse(fs.readFileSync('./scrapper/parsingInfo.json', {encoding: 'utf8'}));
const getParsingInfo = function (refer) {
  return parsingInfoFile.find(info => refer.indexOf(info.domain) !== -1);
};
let referrer, domain, mappingkey, title, description, image, keywords, p_time, u_time, section, author, select_result;
let parsingInfo;
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
