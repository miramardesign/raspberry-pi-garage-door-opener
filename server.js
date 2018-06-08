// server.js
var http = require('http');

var passAnswer = 0408; //eventually may make dynamic, or put spam /repeat protections, 
//needs proximity filter or something to stop ppls from opening randomly. or maybe flood detections.
//todo log user agent

var exec = require('child_process').exec;
var express = require('express');
var sess;
/*
 * sudo apt-get install nodejs-legacy
 * body-parser is a piece of express middleware that
 *   reads a form's input and stores it as a javascript
 *   object accessible through `req.body`
 *
 * 'body-parser' must be installed (via `sudo npm install --save body-parser`)
 * For more info see: https://github.com/expressjs/body-parser
 */
var bodyParser = require('body-parser');

// create our app
var app = express();

// instruct the app to use the `bodyParser()` middleware for all routes
app.use(bodyParser());
var session = require('express-session');
app.use(session({secret: 'ssshhhhh', cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }}));

// A browser's default method is 'GET', so this
// is the route that express uses when we visit
// our site initially.
app.get('/', function(req, res) {
    // The form's action is '/' and its method is 'POST',
    // so the `app.post('/', ...` route will receive the
    // result of our form
    var html = getForm();
    sess = req.session;
    if( sess.hasAuthSession){
      html += '<style>.pass-row{display: none; }</style>';
    }

    res.send(html);
});

// This route receives the posted form.
// As explained above, usage of 'body-parser' means
// that `req.body` will be filled in with the form elements
app.post('/', function(req, res) {
    var pass = parseInt(req.body.pass);
    var hasAuth = false;
	sess = req.session;
	
    if( sess.hasAuthSession){
        hasAuth = true;
    }
 
    var msg;
    var meta_redirect = '';
    var css = '';

    if (hasAuth || pass === passAnswer) {
	sess.hasAuthSession = true;

        //todo change to door.sh when i get the dooor!
        exec('sh door.sh', function(error, stdout, stderr) {
            console.log('stdout: ', stdout);
            console.log('stderr: ', stderr);
            if (error !== null) {
                msg = 'door had error opening or script error!';
                console.log('exec error: ', error);
                res.send(msgPg(msg));
            } else {
                msg = 'open sesame!';
                console.log('cmd had no errs');
                res.send(msgPg(msg));
            }
        });

    } else {
        msg = 'Wrong password ask the cool guy in the cottage.';
        res.send(msgPg(msg));
    }

});
var port = 80; 
app.listen(port);
console.log('listening on port ' + port + ', less than ~1000 needs sudo!');

var head = '<!DOCTYPE html><html><head><title>Garage Door</title> <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/bootswatch/3.1.1-1/css/united/bootstrap.min.css">  <meta name="viewport" content="width=device-width, initial-scale=1"></head>';

//may install hjs later for templating but keeping super simple now!
function getForm() {
    var form = head + '<body><form action="/" method="post">' +
        '<div class="row" ><div class="col-xs-10 col-xs-offset-1 col-md-4 col-md-offset-4"><h3>Garage Door Opener</h3> </div></div>' +
        '<div class="row pass-row" ><div class="col-xs-10 col-xs-offset-1 col-md-4 col-md-offset-4">Password: <input type="number" name="pass" autofocus /></div> </div> ' +
        '<br />' +
        '<div class="row" ><div class="col-xs-10 col-xs-offset-1 col-md-4 col-md-offset-4"> <button type="submit" class="btn btn-block btn-success">Open Sesame</button> </div> </div>' +
        '</form></body></html>';
    return form;
}

function msgPg(msg) {
    var pg = head +
        '<meta http-equiv="refresh" content="15;URL=/">' +
	'<div class="row" ><div class="col-xs-10 col-xs-offset-1 col-md-4 col-md-offset-4"><h3>' + msg + '</h3> </div> </div>' +
        '<div class="row" ><div class="col-xs-10 col-xs-offset-1 col-md-4 col-md-offset-4"><a href="/" class="btn btn-block btn-success"> Back </a> </div> </div>';
	return pg;

}
