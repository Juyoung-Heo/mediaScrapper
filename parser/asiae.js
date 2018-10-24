const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const rp = require('request-promise');

class Asiae extends Parser {
  constructor(refer) {
    super();
    const referDefine = refer.replace('https://', '').replace('http://', '');
    this.refer = referDefine;
  }

  async crawling(refer) {
    await super.crawling(refer);
    await rp(this.options)
      .then(($) => {
        this.keywords = $('meta[name=\'keywords\']').attr('content');
        this.u_time = $('.user_data')[0].children[2].data.replace(/\s/gi, "");
        this.author = $('.e_article').text().replace(/\s/gi, "");
        this.context = $('#txt_area').text().replace(/\s/gi, "");
        this.context = this.context.replace(/\'/gi,"\\\'").replace(/\"/gi,"\\\"");
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  async setInsertSql(mappingkey) {
    this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','asiae.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
  }

  get InsertSql(){
    return this.sql_insert;
  }
}

module.exports = Asiae;