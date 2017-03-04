exports.reportError = function (code, response, err) {
    switch (code) {
        case 500:
            console.error(err.toString());
            response.end(`application error`);
            break;
        default:
            errors.reportError(500, response);
            response.end(`something went wrong`);
    }
}
