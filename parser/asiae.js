const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;

class Asiae extends Parser {
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
      this.keywords = $('meta[name=\'ketwords\']').attr('content');
      this.u_time = $('.user_data')[0].children[2].data.replace(/\s/gi, "");
      this.author = $('.e_article').text().replace(/\s/gi, "");
      this.context = $('#txt_area').text().replace(/\s/gi, "");

      this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','asiae.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
    };

    await request(defineRefer, getSql);
  }

  get InsertSql(){
    return this.sql_insert;
  }
}

module.exports = Asiae;