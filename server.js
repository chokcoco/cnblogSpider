var http = require("http"),
 url = require("url"),
 superagent = require("superagent"),
 cheerio = require("cheerio"),
 async = require("async"),
 eventproxy = require('eventproxy');

var ep = new eventproxy();

var catchFirstUrl = 'http://www.cnblogs.com/',	//入口页面
	deleteRepeat = {},	//去重哈希数组
	urlsArray = [],	//存放爬取网址
	catchDate = [],	//存放爬取数据
	pageUrls = [],	//存放收集文章页面网站
	pageNum = 200,	//要爬取文章的页数
	startDate = new Date(),	//开始时间
	endDate = false;	//结束时间

for(var i=1 ; i<= pageNum ; i++){
	pageUrls.push('http://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex='+ i +'&ParentCategoryId=0');
}

// 抓取昵称、入园年龄、粉丝数、关注数
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
  	  	age = "",
  	  	flag = false,
  	  	curDate = new Date();

  	  // 小概率异常抛错	
  	  try{
  	  	age = "20"+(info.eq(1).attr('title').split('20')[1]);
  	  }
  	  catch(err){
  	  	console.log(err);
  	  	age = "2012-11-06";
  	  }	

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

// 判断作者是否重复
function isRepeat(authorName){
	if(deleteRepeat[authorName] == undefined){
		deleteRepeat[authorName] = 1;
		return 0;
	}else if(deleteRepeat[authorName] == 1){
		return 1;
	}
}

// 主start程序
function start(){
	function onRequest(req, res){
		// 设置字符编码(去掉中文会乱码)
		res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
		// 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
		ep.after('BlogArticleHtml',pageUrls.length*20,function(articleUrls){
			
			// 获取 BlogPageUrl 页面内所有文章链接
			for(var i = 0 ; i < articleUrls.length ; i++){
      	res.write(articleUrls[i] +'<br/>');  
      }    
     	console.log('articleUrls.length is'+ articleUrls.length +',content is :'+articleUrls);

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

						res.write('currentBlogApp is '+ currentBlogApp + ' , ' + 'requestId id is ' + requestId +'<br/>'); 
						console.log('currentBlogApp is '+ currentBlogApp + '\n' + 'requestId id is ' + requestId); 

						res.write('the article title is :'+$('title').text() +'<br/>');

						var flag = 	isRepeat(currentBlogApp);
						
						if(!flag){
							var appUrl = "http://www.cnblogs.com/mvc/blog/news.aspx?blogApp="+ currentBlogApp;
							personInfo(appUrl);
						}
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
				endDate = new Date();

			  console.log('final:');
			  console.log(result);
			  console.log(catchDate);
			  var len = catchDate.length,
			  	aveAge = 0,
			  	aveFans = 0,
			  	aveFocus = 0;

			  for(var i=0 ; i<len ; i++){
			  	var eachDate = JSON.stringify(catchDate[i]),
			  		eachDateJson = catchDate[i];

			  	// 小几率取不到值则赋默认值	
			  	eachDateJsonFans = eachDateJson.fans || 110;
			  	eachDateJsonFocus = eachDateJson.focus || 11;
			  		
			  	aveAge += parseInt(eachDateJson.age);
			  	aveFans += parseInt(eachDateJsonFans);
			  	aveFocus += parseInt(eachDateJsonFocus);
			  	res.write(eachDate +'<br/>'); 
			  }

			  //统计结果
			  res.write('<br/>');
			  res.write('<br/>');
			  res.write('/**<br/>');
			  res.write(' * 爬虫统计结果<br/>');
			  res.write('**/<br/>');
			  res.write('1、爬虫开始时间：'+ startDate +'<br/>');
			  res.write('2、爬虫结束时间：'+ endDate +'<br/>');
			  res.write('3、耗时：'+ (endDate - startDate) +'ms' +' --> '+ (Math.round((endDate - startDate)/1000/60*100)/100) +'min <br/>');
			  res.write('4、爬虫遍历的文章数目：'+ pageNum*20 +'<br/>');
			  res.write('5、作者人数：'+ len +'<br/>');
			  res.write('6、作者入园平均天数：'+ Math.round(aveAge/len*100)/100 +'<br/>');
			  res.write('7、作者人均粉丝数：'+ Math.round(aveFans/len*100)/100 +'<br/>');
			  res.write('8、作者人均关注数：'+ Math.round(aveFocus/len*100)/100 +'<br/>');
			});
		});
		
		// 轮询 所有文章列表页
		pageUrls.forEach(function(pageUrl){
			superagent.get(pageUrl)
				.end(function(err,pres){
					console.log('fetch ' + pageUrl + ' successful');
					res.write('fetch ' + pageUrl + ' successful<br/>');
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
			})
		})
	}

	http.createServer(onRequest).listen(3000);
}

exports.start= start;