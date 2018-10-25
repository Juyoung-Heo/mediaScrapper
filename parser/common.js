// function Parser(domian){
//     this.domain = domain;
//     this.title = "property=\"og:title\"";
//     this.description = "property=\"og:description\"";
//     this.image = "property=\"og:image\"";
//     this.section = "property=\"og:image\"";
// }
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const rp = require('request-promise');

class Parser {
  constructor(refer) {
    this.refer = refer;
  }

  // crawling
  async crawling(ref) {
    this.options = {
      encoding: null,
      method: 'get',
      url: this.refer.startsWith('http') ? this.refer : 'http://' + this.refer,
      transform: function (html) {
        // encode 추출
        let $ = cheerio.load(html);
        let encoding = $('meta[http-equiv=\'Content-Type\']').attr('content') ? $('meta[http-equiv=\'Content-Type\']').attr('content').split('charset=')[1] : $('meta[charset]')[0].attribs.charset; // html4 : html5
        const encode = encoding ? encoding : 'UTF-8';

        // html 추출(+encode 처리)
        const htmlDoc = iconv.decode(new Buffer(html), `${encode}`);
        return cheerio.load(htmlDoc);
      },
      resolveWithFullResponse: true
    };
    await rp(this.options)
      .then(($) => {
        this.title = $('meta[property=\'og:title\']').attr('content');
        this.title = this.title.replace(/\'/gi,"\\\'").replace(/\"/gi,"\\\"");
        this.p_time = $('meta[property=\'article:published_time\']').attr('content');
        this.description = $('meta[property=\'og:description\']').attr('content');
        this.description = this.description.replace(/\'/gi,"\\\'").replace(/\"/gi,"\\\"");
        this.image = $('meta[property=\'og:image\']').attr('content');
        this.section = $('meta[property=\'article:section\']').attr('content');
      })
      .catch(function (err) {
        console.error(err);
      })
  }
}

module.exports = Parser;