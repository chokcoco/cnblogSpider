var http = require("http"),
 url = require("url"),
 superagent = require("superagent"),
 cheerio = require("cheerio"),
 async = require("async"),
 eventproxy = require('eventproxy'),
 iconv = require("iconv-lite");

var ep = new eventproxy();

var catchFirstUrl = 'http://www.cnblogs.com/',	//入口页面
	deleteRepeat = {},	//去重哈希数组
	urlsArray = [],	//存放爬取网址
	catchDate = [],	//存放爬取数据
	pageUrls = [];	//存放收集文章页面网站

for(var i=1 ; i<=2 ; i++){
	pageUrls.push('http://www.cnblogs.com/#p'+i);
}

function personInfo(url){
	var infoArray = {};
	superagent.get(url)
		.end(function(err,ares){
			if (err) {
	      console.log(err);
	      return;
	    }

	    var $ = cheerio.load(ares.text),
				info = $('#profile_block a'),
  	  	len = info.length,
  	  	age = "20"+(info.eq(1).attr('title').split('20')[1]),
  	  	flag = false,
  	  	curDate = new Date();

	    infoArray.name = info.eq(0).text();
	    infoArray.age = parseInt((new Date() - new Date(age))/1000/60/60/24);
	    
	    if(len == 4){
	 	    infoArray.fans = info.eq(2).text();
	    	infoArray.focus = info.eq(3).text();	
	    }else if(len == 5){// 博客园推荐博客
	 	    infoArray.fans = info.eq(3).text();
	    	infoArray.focus = info.eq(4).text();	
	    }

	    //console.log('用户信息:'+JSON.stringify(infoArray));
	    catchDate.push(infoArray);
	});
}

function start(){
	function onRequest(req, res){
		ep.after('BlogArticleHtml',pageUrls.length,function(BlogPageUrl){
			
			for(var i = 0 ; i < urlsArray.length ; i++){
      	res.write(urlsArray[i] +'\n');  
      }    
     	console.log('urlsArray.length is'+ urlsArray.length +',content is :'+urlsArray);

     	//控制并发数
     	var curCount = 0;
     	var reptileMove = function(url,callback){
     		//延迟毫秒数
     		var delay = parseInt((Math.random() * 20000000) % 1000, 10);
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

						res.write('currentBlogApp is '+ currentBlogApp + '\n' + 'requestId id is ' + requestId); 
						console.log('currentBlogApp is '+ currentBlogApp + '\n' + 'requestId id is ' + requestId); 

						var appUrl = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp="+ currentBlogApp;
						var info = personInfo(appUrl);
		  		});

		  	setTimeout(function() {
			    curCount--;
			    callback(null,url +'Call back content');
			  }, delay);		
     	};

	    //使用async控制异步抓取 	
	    //mapLimit(arr, limit, iterator, [callback])
      async.mapLimit(urlsArray, 12 ,function (url, callback) {
			  reptileMove(url, callback);
			}, function (err,result) {
			  console.log('final:');
			  console.log(result);
			  console.log(catchDate);
			  var len = catchDate.length;
			  for(var i=0 ; i<len ; i++){
			  	var eachDate = JSON.stringify(catchDate[i]);
			  	res.write(eachDate +'\n'); 
			  } 
			});
		});

		pageUrls.forEach(function(pageUrl){
			superagent.get(pageUrl)
				.end(function(err,sres){
					console.log('fetch ' + pageUrl + ' successful');
					// 常规的错误处理
		      if (err) {
		        console.log(err);
		   		}
		      // sres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
		      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
		      // 剩下就都是 jquery 的内容了
		      var $ = cheerio.load(sres.text);
		      var curPageUrls = $('.titlelnk');
		      for(var i = 0 ; i < curPageUrls.length ; i++){
		      	urlsArray.push(curPageUrls.eq(i).attr('href'));
		      }
		      ep.emit('BlogArticleHtml', pageUrl);
			})
		})
	}

	http.createServer(onRequest).listen(3000);
}


exports.start= start;