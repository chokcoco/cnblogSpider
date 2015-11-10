/**
 * 写blog的时候拆出来的示例打码
 * 完整的 爬虫代码 在 server.js 中
 * 
 */
 
var http = require("http"),
 url = require("url"),
 superagent = require("superagent"),
 cheerio = require("cheerio"),
 async = require("async"),
 eventproxy = require('eventproxy');

var ep = new eventproxy(), 
	urlsArray = [],	//存放爬取网址
	pageUrls = [],	//存放收集文章页面网站
	pageNum = 200;	//要爬取文章的页数

for(var i=1 ; i<= 200 ; i++){
	pageUrls.push('http://www.cnblogs.com/#p'+i);
}

for(var i=1 ; i<= pageNum ; i++){
	pageUrls.push('http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex='+ i +'&ParentCategoryId=0');
}

// 主start程序
function start(){
	function onRequest(req, res){	
		// 轮询 所有文章列表页
		pageUrls.forEach(function(pageUrl){
			superagent.get(pageUrl)
				.end(function(err,pres){
					// 常规的错误处理
		      if (err) {
		        console.log(err);
		   		}
		      // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
		      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
		      // 剩下就都是 jquery 的内容了
		      var $ = cheerio.load(pres.text);
		      var curPageUrls = $('.titlelnk');

		      for(var i = 0 ; i < curPageUrls.length ; i++){
		      	var articleUrl = curPageUrls.eq(i).attr('href');
		      	urlsArray.push(articleUrl);
		      	// 相当于一个计数器
		      	ep.emit('BlogArticleHtml', articleUrl);
		      }
			});
		});

		ep.after('BlogArticleHtml',pageUrls.length*20,function(articleUrls){
		  // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
		  
     	//控制并发数
     	var curCount = 0;
     	var reptileMove = function(url,callback){
     		//延迟毫秒数
     		var delay = parseInt((Math.random() * 30000000) % 1000, 10);
			  curCount++;
			  console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');  
		  	
		  	superagent.get(url)
		  		.end(function(err,sres){
			  		// 常规的错误处理
			      if (err) {
			        console.log(err);
			        return;
			      }		  	

			      //sres.text 里面存储着请求返回的 html 内容
			      var $ = cheerio.load(sres.text);
			      //收集数据
			      //1、收集用户个人信息，昵称、园龄、粉丝、关注
						//var currentBlogApp = $('script').eq(1).text().split(',')[0].split('=')[1].trim().replace(/'/g,""),
						var currentBlogApp = url.split('/p/')[0].split('/')[3],	
							requestId = url.split('/p/')[1].split('.')[0];

						var appUrl = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp="+ currentBlogApp;
						personInfo(appUrl);
						
		  		});

		  	setTimeout(function() {
			    curCount--;
			    callback(null,url +'Call back content');
			  }, delay);		
     	};

	    // 使用async控制异步抓取 	
	    // mapLimit(arr, limit, iterator, [callback])
	    // 异步回调
      async.mapLimit(articleUrls, 5 ,function (url, callback) {
			  reptileMove(url, callback);
			}, function (err,result) {
				// 4000 个 URL 访问完成的回调函数
				// ...
			});
		});
	}
	http.createServer(onRequest).listen(3000);
}
exports.example= start;


