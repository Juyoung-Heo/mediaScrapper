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

const dbCon = async () => {
  judyConn = await mysql.createConnection({
    host: '52.78.97.180',
    user: 'root',
    password: 'ciziondb*0707!',
    database: 'judy'
  });
};
dbCon();

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
  if (mappingkey_result.length > 0) {
    console.log(mappingkey_result[0].mappingkey);
    mappingkey = mappingkey_result[0].mappingkey;
    res.send(mappingkey);
  } else {
    //request({url: defineRefer, encoding: null}, getResponse);
    const lastId_select = `select * from referrer_info order by id desc limit 1`;
    let lastId_result = await judyConn.query(lastId_select);
    const newId = parseInt(lastId_result[0].id) + 1;
    mappingkey = base62.encode(newId);

    const press = "Kbs";
    const news = new parser[press](defineRefer);
    news.crawling(defineRefer);
    news.insertSql(mappingkey);
    console.log(news.insertQuery);
  }
  // mappingkey = mappingkey_result[0].mappingkey;
  // res.send(mappingkey);
  res.end();
});

const parsingInfoFile = JSON.parse(fs.readFileSync('./scrapper/parsingInfo.json', {encoding: 'utf8'}));
const getParsingInfo = function (refer) {
  return parsingInfoFile.find(info => refer.indexOf(info.domain) !== -1);
};

let referrer, domain, mappingkey, title, description, image, keywords, p_time, u_time, section, author, select_result;
let parsingInfo;
const getResponse = async (err, response, html) => {
  const iconv = new Iconv(`${parsingInfo.encoding}`, `UTF-8//translit//ignore`);
  const htmlDoc = iconv.convert(html).toString('utf-8');
  const $ = cheerio.load(htmlDoc);
  referrer = response.request.href.replace('https://', '').replace('http://', '');
  domain = `${parsingInfo.domain}`;
  title = $(`meta[${parsingInfo.title}]`).attr('content') ? $(`meta[${parsingInfo.title}]`).attr('content').replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"") : "";
  description = $(`meta[${parsingInfo.description}]`).attr('content') ? $(`meta[${parsingInfo.description}]`).attr('content').replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"") : "";
  image = $(`meta[${parsingInfo.image}]`).attr('content');
  keywords = $(`meta[${parsingInfo.keywords}]`).attr('content');
  p_time = $(`meta[${parsingInfo.p_time}]`).attr('content');
  u_time = $(`meta[${parsingInfo.u_time}]`).attr('content');
  section = $(`meta[${parsingInfo.section}]`).attr('content');
  author = $(`meta[${parsingInfo.author}]`).attr('content');

  const lastId_select = `select * from referrer_info order by id desc limit 1`;
  let lastId_result = await judyConn.query(lastId_select);
  const newId = parseInt(lastId_result[0].id) + 1;
  mappingkey = base62.encode(newId);

  //select
  const sql_select = `select * from referrer_info where referrer = '${referrer}'`;
  select_result = await judyConn.query(sql_select);
  saveResponse();
};

function saveResponse() {
  if (select_result.length > 0) {
    //update
    const sql_update = `update referrer_info set referrer = '${referrer}', domain = '${domain}', mappingkey = '${mappingkey}', title = '${title}', description = '${description}', image = '${image}', keywords = '${keywords}', published_time = '${p_time}', updated_time='${u_time}', section = '${section}', author='${author}' where id = '${select_result[0].id}'`;
    judyConn.query(sql_update, function (err, result) {
      if (err) throw err;
      console.log("record(s) updated");
    });
  } else {
    //insert
    const sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author) values('${referrer}','${domain}','${mappingkey}','${title}','${description}','${image}','${keywords}','${p_time}','${u_time}','${section}','${author}')`;
    judyConn.query(sql_insert, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  }
};

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
