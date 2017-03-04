"use strict";

const Engine = module.exports = class {
    constructor() {};
    render (text, context) {
        return instantiate(text, context);
    };
}

const cmdList = Object.create(null);

cmdList.each = function (blkExp, innerBlock, collection) {
    if (blkExp.length !== 2)
        throw new SyntaxError ('invalid number of arguments');

    let result;
    if (Array.isArray(collection)) {
        result = instantiateArray(innerBlock, collection);
    } else {
        result = instantiateText(innerBlock, collection);
        }
    return result;
};

const Callables = Object.create(null);

Callables.Date = function getTime(date) {
    var date = new Date(date);
    var hours = (date.getHours() > 9)
    ? date.getHours()
    : '0' + date.getHours();
    var minutes = (date.getMinutes() > 9)
    ? date.getMinutes()
    : '0' + date.getMinutes();
    return hours + ':' + minutes;
}

function instantiate(text, context) {
    text = instantiateBlk(text, context);
    text = instantiateText(text, context);
    return text;
}

function instantiateArray(text, arr) {
    let result = '';
    for (var i = 0; i < arr.length; i++) {
        let item = arr[i], newItem;
        result += text.replace(/\{\{\s?(.+?)\s?\}\}/g, (_, name)=>{
            if (varIsPath(name) && varIsCallable(name)) {
                let pathArray = name.split('.');
                for (var i = 1; i < pathArray.length; i++) {
                    newItem = item[pathArray[i]];
                    // perhaps removes this line later
                    newItem = instantiate(newItem, item);
                }
                // return newItem;
                let matchArray = name.split(' ');
                let caller = matchArray[1];
                return Callables[caller](newItem);
            } else if (varIsPath(name)) {
                let pathArray = name.split('.');
                for (var i = 1; i < pathArray.length; i++) {
                    newItem = item[pathArray[i]];
                    instantiate(newItem, item);
                }
                return newItem;
            }
            return item;
        });
    }
    return instantiate(result, arr);
}


function instantiateText(text, context) {
    return text.replace(/\{\{\s?(.+?)\s?\}\}/g, (_, name)=>{
        if (varIsPath(name)) {
            let pathArray = name.split('.');
            let item = context;
            for (var i = 0; i < pathArray.length; i++) {
                item = item[pathArray[i]];
            }
            return item;
        } else {
            if (context[name]) {
                return context[name];
            } else {
                return `{{${name}}}`;
            }
        }
    });
}


function varIsCallable (match) {
    let matchArray = match.split(' ');
    if (matchArray.length > 1 && matchArray[0] === 'call')
        return true;
    return false;
}

function varIsPath(match) {
    if (
        match.indexOf('.') > 0 &&
        match.indexOf('.') !== match.length - 1 &&
        match.indexOf(/\bcall\b/) == -1
    )
        return true;
    return false;
}


function instantiateBlk(text, context) {
    function findEndToken() {
        let match;
        while (match = re.exec(text)) {
            if (match[1] == 'end' + cmd)
                return match;
        }
        throw new SyntaxError(`no closing tag for ${blk[0]}`);
    }

    let re = /\{\%\s?(.+?)\s?\%\}/g;
    let blk = re.exec(text);
    if (!blk)
        return text;
    let blkExp = blk[1].split(' ');
    let cmd = blkExp[0];
    let iterable = context[blkExp[blkExp.length - 1]];

    let outerBlockStart = blk.index;
    let innerBlockStart = re.lastIndex;
    let blkEnd = findEndToken();
    let innerBlockEnd = blkEnd.index;
    let outerBlockEnd = re.lastIndex;
    let preBlockText = text.slice(0, outerBlockStart);
    let postBlockText = text.slice(outerBlockEnd)

    let innerBlock = text.slice(innerBlockStart, innerBlockEnd);

    if (cmd in cmdList) {
        innerBlock = cmdList[cmd](blkExp, innerBlock, iterable);
    } else {
        throw new SyntaxError(`invalid block tag '${cmd}' in '${blk[0]}'`)
    }

    innerBlock = instantiate(innerBlock, context);

    return preBlockText + innerBlock + postBlockText;
}
