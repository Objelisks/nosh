var os = require('os');
var child_process = require('child_process');

var errorMap = {
    'ENOENT' : "Command not found.",
};
var customCommands = {
    'cd' : function(path) { process.chdir(path); },
    'pwd' : function() { console.log(process.cwd()); },
};

function logError(msg) {
    return function(err) {
        if(err && errorMap[err.code]) {
            console.log(msg + ': ' + errorMap[err.code]);
        } else if(err && err.code) {
            console.log('Error: ' + err.code);
        }
    }
}

var compose = exports.compose = function(fn, callback) {
    return function() {
        fn();
        callback();
    }
}

function commandEnd() {
    process.stdin.unpipe();
}

exports.getUsername = function() {
    if(os.platform() === 'win32') {
        return process.env['USERNAME'];
    } else {
        return process.env['USER'];
    }
};

exports.runCommand = function(line, callback) {
  callback = compose(commandEnd, callback);
  var args = line.trim().split(' ');
  var cmd = args.shift();
  if(customCommands[cmd]) {
    customCommands[cmd].apply(null, args);
    callback();
  } else {
    var child = child_process.spawn(cmd, args);
    process.stdin.pipe(child.stdin);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', callback);
    child.on('error', compose(logError(cmd), callback));
  }
};
