const Parser = require('./common');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const rp = require('request-promise');

class Kmib extends Parser {
  constructor(refer) {
    super();
    this.refer = refer;
  }

  async setInsertSql(mappingkey) {
    const options = {
      encoding: null,
      method: 'get',
      url: this.refer.startsWith('http') ? this.refer : 'http://' + this.refer,
      transform: function (html) {
        const htmlDoc = iconv.decode(html, 'EUC-KR');
        return cheerio.load(htmlDoc);
      },
      resolveWithFullResponse: true
    };

    await rp(options)
      .then(($) => {
        this.keywords = '-';
        this.u_time = '-';
        this.author = $('meta[property=\'dable:author\']').attr('content');
        this.context = $('#article').text().replace(/\s/gi, "");
        this.context = this.context.replace(/\'/gi, "\\\'").replace(/\"/gi, "\\\"");

        this.sql_insert = `insert into referrer_info (referrer, domain, mappingkey, title, description, image, keywords, published_time, updated_time, section, author, context) values('${this.refer}','news.kbs.co.kr','${mappingkey}','${this.title}','${this.description}','${this.image}','${this.keywords}','${this.p_time}','${this.u_time}','${this.section}','${this.author}' , '${this.context}')`;
      })
      .catch(function (err) {
        console.error(err);
      })
  }

  get InsertSql() {
    return this.sql_insert;
  }
}

module.exports = Kmib;