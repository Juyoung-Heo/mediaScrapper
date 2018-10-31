const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const rp = require('request-promise');

class Kbs extends Parser {
  constructor(refer) {
    super();
    const referDefine = refer.replace('https://', '').replace('http://', '');
    this.refer = referDefine;
  }

  async crawling(refer) {
    await super.crawling(refer);
    await rp(this.options)
      .then(($) => {
        this.keywords = '';
        this.u_time = '';
        this.p_time = $('.date').text().replace('입력 ', '');
        this.section = $('title').text().split('>')[1].replace(' | KBSNEWS', '').replace(/\s/gi, "");
        this.author = $('meta[name=\'twitter:creator\']').attr('content');
        this.context = $('#cont_newstext').text().replace(/\s/gi, "");
        this.context = this.context.replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"");
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  async setInsertSql(mappingkey) {
    this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','kbs.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
  }

  get InsertSql() {
    return this.sql_insert;
  }
}

module.exports = Kbs;