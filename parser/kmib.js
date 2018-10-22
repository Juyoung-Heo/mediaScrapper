const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;

class Kmib extends Parser {
  constructor(refer) {
    super();
    this.refer = refer;
  }

  async setInsertSql(mappingkey) {
    const defineRefer = this.refer.startsWith('http') ? this.refer : 'http://' + this.refer;
    const getSql = (err, response, html) => {
      // html utf8로 추출
      const iconv = new Iconv(`UTF-8`, `UTF-8//translit//ignore`);
      const htmlDoc = iconv.convert(html).toString('utf-8');
      const $ = cheerio.load(htmlDoc);
      this.keywords = '';
      this.u_time = '';
      this.p_time = $('.date').text().replace('입력 ','');
      this.section = $('title').text().split('>')[2].replace(' | KBSNEWS', '').replace(/\s/gi, "");
      this.author = $('meta[name=\'twitter:creator\']').attr('content');
      this.context = $('#cont_newstext').text().replace(/\s/gi, "");

      this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','news.kbs.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
    };

    await request(defineRefer, getSql);
  }

  get InsertSql(){
    return this.sql_insert;
  }
}

module.exports = Kmib;