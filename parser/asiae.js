const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

class Asiae extends Parser {
  constructor(refer) {
    super();
    this.refer = refer;
  }

  async setInsertSql(mappingkey) {
    const defineRefer = {encoding:null, method:'get', url:this.refer.startsWith('http') ? this.refer : 'http://' + this.refer};
    const getSql = (err, response, html) => {
      // html utf8로 추출
      const htmlDoc = iconv.decode(new Buffer(html), 'UTF-8');
      const $ = cheerio.load(htmlDoc);
      this.keywords = $('meta[name=\'ketwords\']').attr('content');
      this.u_time = $('.user_data')[0].children[2].data.replace(/\s/gi, "");
      this.author = $('.e_article').text().replace(/\s/gi, "");
      this.context = $('#txt_area').text().replace(/\s/gi, "");
      this.context = this.context.replace(/\'/gi,"\\\'").replace(/\"/gi,"\\\"");

      this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','asiae.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
    };

    await request(defineRefer, getSql);
  }

  get InsertSql(){
    return this.sql_insert;
  }
}

module.exports = Asiae;