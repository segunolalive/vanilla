var fs = require("fs");
var http = require("http");
var url = require('url');


var methods = Object.create(null);

const PORT = process.env.PORT || 8000;

var Server = module.exports = function (request, response) {
    function respond(code, body, type) {
        if (!type) type = "text/plain";
            response.writeHead(code, {"Content-Type": type});
            response.writeHead(code, {
                'Cache-Control': 'public, max-age=2592000'
            });
        if (body && body.pipe)
            body.pipe(response);
        else
            response.end(body);
    }
    if (request.method in methods)
        methods[request.method](urlToPath(request.url), respond, request);
    else
        respond(405, "Method " + request.method + " not allowed.");

};


function urlToPath(requestUrl) {
  var path = url.parse(requestUrl).pathname;
  var decoded = decodeURIComponent(path);
  return "." + decoded.replace(/(\/|\\)\.\.(\/|\\|$)/g, "/");
}


methods.GET = function(path, respond) {
  fs.stat(path, function(error, stats) {
    if (error && error.code == "ENOENT")
      respond(404, "File not found");
    else if (error)
      respond(500, error.toString());
    else if (stats.isDirectory())
      fs.readdir(path, function(error, files) {
        if (error)
          respond(500, error.toString());
        else
          respond(200, files.join("\n"));
      });
    else
      respond(200, fs.createReadStream(path),
              require("mime").lookup(path));
  });
};
