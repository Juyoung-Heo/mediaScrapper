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
    const options = {
      encoding: null,
      method: 'get',
      url: this.refer.startsWith('http') ? this.refer : 'http://' + this.refer,
      transform: function (html) {
        // encode 추출
        let $ = cheerio.load(html);
        const encoding = $('meta[http-equiv=\'Content-Type\']').attr('content');
        const encode = encoding ? encoding.split('charset=')[1] : 'UTF-8';

        // html 추출(+encode 처리)
        const htmlDoc = iconv.decode(new Buffer(html), `${encode}`);
        return cheerio.load(htmlDoc);
      },
      resolveWithFullResponse: true
    };
    await rp(options)
      .then(($) => {
        this.title = $('meta[property=\'og:title\']').attr('content');
        this.p_time = $('meta[property=\'article:published_time\']').attr('content');
        this.description = $('meta[property=\'og:description\']').attr('content');
        this.image = $('meta[property=\'og:image\']').attr('content');
        this.section = $('meta[property=\'article:section\']').attr('content');
      })
      .catch(function (err) {
        console.error(err);
      })
  }
}

module.exports = Parser;