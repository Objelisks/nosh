#!/bin/node

var os = require('os');
var readline = require('readline');
var child_process = require('child_process');

process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var keys = process.stdin.on('data', function(key) {
    var pretty = new Buffer(key, 'utf8').toString('hex');
    if(pretty === '1b') { 
        rl.write(null, {ctrl:true, name:'u'});
    }
});

function setPrompt() {
    var user = process.env['USER'];
    var now = new Date();
    var ampm = now.getHours() <= 11 ? 'AM' : 'PM';
    var time = (now.getHours()%12) + ':'
        + ('00' + now.getMinutes()).slice(-2) + '' + ampm;
    var git = '()';
    rl.setPrompt(user + '@' + ' ' + time + ':' + git + '%');
};

var n = 0;
function cont() {
    n = n + 1;
    setPrompt();
    rl.prompt(true);
}
var errorMap = {
    'ENOENT' : "Command not found: "
};
function logError(cmd, callback) {
    return function(err) {
        if(errorMap[err.code]) {
            console.log(errorMap[err.code] + cmd);
        } else {
            console.log(err.code);
        }
        callback();
    };
}

var customCommands = {
    'cd' : function(path) { process.chdir(path); },
};
/*rl.on('SIGINT', function() {
    console.log('nope');
});*/
rl.on('line', function(line) {
    if(line.length == 0) return;
    var args = line.trim().split(' ');
    var cmd = args.shift();
    if(customCommands[cmd]) {
        customCommands[cmd].apply(null, args);
        cont();
    } else {
        var child = child_process.spawn(cmd, args);
        child.stdout.pipe(process.stdout);
        child.on('exit', cont);
        child.on('error', logError(cmd, cont));
    }
});

cont();
