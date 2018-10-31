const express = require('express');
const asyncify = require('express-asyncify');
const router = asyncify(express.Router());

const fs = require('fs');
const sha1 = require('sha1');
const sha256 = require('sha256');
// const mysql = require('promise-mysql');
const mysql = require('mysql');
const parser = require('../parser/init');

let judyConn;
let len = 7;
let matchRefer = '123';

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
  console.log('connected');
} catch (err) {
  console.error(err);
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'});
});

// get mapping key show info
router.get('/info/:key', async (req, res) => {
  const infoSelect = `select * from referrer_info where mappingkey = '${req.params.key}'`;
  const infoSelect_result = await judyConn.query(infoSelect);
  res.json(infoSelect_result);
});

// get mapping key redirect
router.get('/redirect/:key', async (req, res) => {
  const redSelect = `select * from referrer_info where mappingkey = '${req.params.key}'`;
  const redSelect_result = await judyConn.query(redSelect);
  const redUri = redSelect_result[0].referrer.startsWith('http') ? redSelect_result[0].referrer : 'http://' + redSelect_result[0].referrer;
  res.redirect(redUri);
});

//select
router.get('/api/refer', async (req, res) => {
  // 기존 값 유무 확인
  const refer = req.query.refer.replace('https://', '').replace('http://', '');
  const mappingkey_select = `select * from referrer_info where referrer = '${refer}'`;
  const mappingkey_result = await judyConn.query(mappingkey_select);

  if (mappingkey_result.length > 0) {
    // 기존 정보 있을 때
    mappingkey = mappingkey_result[0].mappingkey;
  } else {
    // 기존 정보 없을 때
    // request 에 던질 url 준비
    const defineRefer = refer.startsWith('http') ? refer : 'http://' + refer;

    // 새로운 mappingkey 생성
    keyDuplicate(refer);



    // 새로 크롤링
    const media = (findModule(refer)).capitalize();
    const news = new parser[media](defineRefer);
    await news.crawling(defineRefer);
    await news.setInsertSql(mappingkey);
    const sql_insert = news.InsertSql;

    // db insert
    const dbInsert = await judyConn.query(sql_insert);
    if(dbInsert){
      console.log("1 record inserted");
    }
  }
  //res.send(mappingkey);
  res.send({key: mappingkey});
});
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

// 도메인 sld tld
const stld = ['com', 'net', 'asia', 'info', 'biz', 'mobi', 'org', 'name', 'tel', 'co', 'kr', 'pe', '한국', 'ac', 'ae', 'af', 'ag', 'ai', 'am', 'at', 'au', 'be', 'br', 'bz', 'ca', 'cc', 'cd', 'ch', 'cm', 'cn', 'cx', 'de', 'dk', 'es', 'eu', 'fm', 'fr', 'gg', 'gs', 'hn', 'ht', 'il', 'im', 'in', 'io', 'it', 'je', 'jp', 'ki', 'la', 'lc', 'li', 'me', 'mn', 'ms', 'mu', 'mx', 'my', 'nl', 'nu', 'nz', 'pe', 'pl', 'pr', 'sb', 'sc', 'sg', 'sh', 'so', 'st', 'tc', 'tk', 'tl', 'tm', 'tw', 'tv', 'ua', 'uk', 'us', 'uy', 'vn', 'ws', 'qa', 'za'];
let moduleName;

function findModule(refer) {
  // sub top 구분
  const referArray = refer.split('.');
  if (referArray[0] === 'www') {
    moduleName = referArray[1];
  } else if (stld.indexOf(referArray[1]) !== -1) {
    moduleName = referArray[0];
  } else {
    moduleName = referArray[1];
  }

  //  Mk 일때
  if (moduleName === "mk") {
    return `mk${referArray[0].capitalize()}`;
  } else {
    return moduleName;
  }
}

// mappingkey 생성
let mappingkey;

function makeKey(refer, num) {
  const shaRefer = sha256(refer);
  const cutRefer = shaRefer.substr(0, num);
  const parseRefer = parseInt(cutRefer, 16);
  const baseRefer = base62.encode(parseRefer);

  return baseRefer;
}

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

async function keyDuplicate(refer){
  while (matchRefer !== '') {
    matchRefer = '';
    const newKey = makeKey(refer, len);
    const testSelect = `select * from referrer_info where mappingkey = '${newKey}'`;
    let rows = await judyConn.query(testSelect);
    if (rows.length) {
      matchRefer = rows[0].referrer;
    }
    if (matchRefer !== '') {
      if (matchRefer !== refer) {
        len++;
      }
    } else {
      mappingkey = newKey;
    }
  }
}


module.exports = router;

