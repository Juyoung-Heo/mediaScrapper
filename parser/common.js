// function Parser(domian){
//     this.domain = domain;
//     this.title = "property=\"og:title\"";
//     this.description = "property=\"og:description\"";
//     this.image = "property=\"og:image\"";
//     this.section = "property=\"og:image\"";
// }
const request = require('request');
const cheerio = require('cheerio');
const Iconv = require('iconv').Iconv;

class Parser {
  constructor(refer) {
    this.refer = refer;
  }
  // crawling
  crawling(ref){
    const defineRefer = ref.startsWith('http') ? ref : 'http://' + ref;
    request(defineRefer, function (err, response, html){
      // encode 추출
      let $ = cheerio.load(html);
      const encoding = $('meta[http-equiv=\'Content-Type\']').attr('content');
      const encode = (encoding.split('; '))[1].replace("charset=", "");

      // html 추출(+encode 처리)
      const iconv = new Iconv(`${encode}`, `UTF-8//translit//ignore`);
      const htmlDoc = iconv.convert(html).toString('utf-8');
      $ = cheerio.load(htmlDoc);

      this.title = $('meta[name=\'twitter:title\']').attr('content');
      this.description = $('meta[property=\'og:description\']').attr('content');
      this.image = $('meta[property=\'og:image\']').attr('content');
      this.section = $('meta[property=\'article:section\']').attr('content');
    });
  }

  //


  // get


}

module.exports = Parser;