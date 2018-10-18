const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;

class Kbs extends Parser {
  constructor(refer) {
    super();
    this.refer = refer;
  }

  insertSql(mappingkey) {
    const defineRefer = this.refer.startsWith('http') ? this.refer : 'http://' + this.refer;
    request(defineRefer, (err, response, html) => {
      // html 추출
      const iconv = new Iconv(`UTF-8`, `UTF-8//translit//ignore`);
      const htmlDoc = iconv.convert(html).toString('utf-8');
      const $ = cheerio.load(htmlDoc);
      this.keywords = '';
      this.u_time = '';
      this.p_time = $('em[class=\'date\']')[0].children[0].data.replace('입력 ', '');
      this.section = $('title')[0].children[0].data.split('>')[2].replace(' | KBSNEWS', '');
      this.author = $('meta[name=\'twitter:creator\']').attr('content');
      this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author) values('${this.refer}','news.kbs.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}')`;
    });
  }

  get insertQuery() {
    return this.sql_insert;
  }
}

module.exports = Kbs;