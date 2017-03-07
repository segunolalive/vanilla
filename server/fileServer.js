const fs = require("fs");
const http = require("http");
const url = require('url');


const methods = Object.create(null);

const PORT = process.env.PORT || 8000;

const Server = module.exports = (request, response) => {
    function respond(code, body, type) {
        if (!type) type = "text/plain";
            response.writeHead(code, {"Content-Type": type});
            // max-age = 30 days;
            response.writeHead(code, {
                'Cache-Control': 'public, max-age=2592000, must-revalidate'
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
  let path = url.parse(requestUrl).pathname;
  let decoded = decodeURIComponent(path);
  return "." + decoded.replace(/(\/|\\)\.\.(\/|\\|$)/g, "/");
}


methods.GET = function(path, respond) {
  fs.stat(path, (error, stats) => {
    if (error && error.code == "ENOENT"){
      respond(404, "File not found");
    } else if (error) {
      respond(500, error.toString());
    } else if (stats.isDirectory()){
      fs.readdir(path, (error, files) => {
        if (error){
          respond(500, error.toString());
        } else {
          respond(200, files.join("\n"));
        }
      });
    } else {
      respond(200, fs.createReadStream(path),
              require("mime").lookup(path));
    }
  });
};
