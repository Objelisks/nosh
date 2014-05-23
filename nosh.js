#!/bin/node

var helper = require('./helper.js');
var readline = require('readline');
var child_process = require('child_process');

process.title = 'nosh.js';
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
    var user = helper.getUsername();
    var now = new Date();
    var ampm = now.getHours() <= 11 ? 'AM' : 'PM';
    var time = (now.getHours()%12) + ':'
        + ('00' + now.getMinutes()).slice(-2) + '' + ampm;
    var git = '()';
    rl.setPrompt(user + '@' + ' ' + time + ':' + git + '% ');
};

var n = 0;
function cont() {
    rl.resume();
    n = n + 1;
    setPrompt();
    rl.prompt(true);
}

rl.on('SIGINT', function() {
    console.log('cya');
    process.exit(0);
});
rl.on('line', function(line) {
    if(line.length == 0) return;
    // get all tokens
    // parse separators
    // convert to javascript
    //
    // var cmd = parse('a aargs | b bargs &');
    //   var next;
    //   var commands = line.trim().split(separators, separatorTokens);
    //   var args = commands[0].trim().split(' ');
    //   var command = args.shift();
    //   var modifier = separatorTokens[0];
    //   var runable = run(command, args);
    //   if(pipeFlag) next.pipe(runable.stdin); pipeFlag = false;
    //   switch(modifer)
    //     |: next = runable.stdout; pipeFlag = true;
    //     &: runable = runAsync(runable);
    //     >: next = runable.stdout; pipeFileFlag = true;
    //
    // var cmd = run(a, aargs).pipe(runAsync(b, bargs)).then(setInterval(run(c, cargs), 1000));
    // cmd();
    helper.runCommand(line, cont);
});

cont();
