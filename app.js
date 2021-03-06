

var express = require('express');
var routes = require('./routes');
var stack = require('./routes/stack.js');
var carBiz = require('./routes/carBiz.js');
var nginxSupervisory = require('./routes/nginxSupervisory.js');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');
var app = express();

// all environments
app.set('port', process.env.PORT || 8888);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', "ejs");
app.engine('ejs', engine);
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', stack.stackRT);
app.get('/prt', routes.programRT);
app.get('/mvcrt', routes.mvcRT);
app.get('/cd', routes.chartData);


app.get('/md', routes.mainData);
app.get('/groupIP', routes.groupIP);
app.get('/groupUA', routes.groupUA);
app.get('/groupReferer', routes.groupReferer);

app.get('/stack/cmd', stack.chartMaxData);
app.get('/stack/md', stack.mainData);
app.get('/stack/servers', stack.servers);
app.get('/stack/mc', stack.maxCall);
app.get('/stack', stack.stackRT);

app.get('/carBiz',carBiz.carBizRT);
app.get('/carBiz/servers', carBiz.servers);
app.get('/carBiz/md', carBiz.mainData);
app.get('/carBiz/cmd', carBiz.chartMaxData);

app.get('/nginxSupervisory',nginxSupervisory.index);
app.get('/nginxSupervisory/data',nginxSupervisory.data);
app.get('/nginxSupervisory/chart',nginxSupervisory.chart);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
