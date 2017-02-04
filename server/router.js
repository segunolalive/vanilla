var Router = module.exports = function () {
    this.routes = [];
}

Router.prototype.add = function (method, url, handler) {
    this.routes.push({
        method: method,
        url: url,
        handler: handler,
    });
};

Router.prototype.resolve = function (request, response) {
    let urlObject = require('url').parse(request.url);
    let path = urlObject.pathname;
    return this.routes.some((route)=>{
        let match = route.url.exec(path);
        if (!match || route.method != request.method)
          return false;

        let urlParts = match.slice(1).map(decodeURIComponent);
        route.handler.apply(null, [request, response].concat(urlParts));
        return true;
    });
};
