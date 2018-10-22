const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;
const iconvlite = require('iconv-lite');

class Mk extends Parser {
  constructor(refer) {
    super();
    this.refer = refer;
  }

  async setInsertSql(mappingkey) {
    const defineRefer = this.refer.startsWith('http') ? this.refer : 'http://' + this.refer;
    const getSql = (err, response, html) => {
      // html utf8로 추출
      const iconv = new Iconv(`EUC-KR`, `UTF-8//translit//ignore`);
      const content = iconvlite.decode(new Buffer(html), 'euc-kr').toString();
      const htmlDoc = iconv.convert(html).toString();
      const $ = cheerio.load(htmlDoc);
      this.keywords = '';
      this.u_time = '';
      this.author = '';
      this.context = $('#article_body').text().replace(/\s/gi, "");

      this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','mk.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
    };

    await request(defineRefer, getSql);
  }

  get InsertSql(){
    return this.sql_insert;
  }
}

module.exports = Mk;