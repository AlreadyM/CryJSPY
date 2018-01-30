const  repl = require('repl');
const msg = 'message';

repl.start('>').context.m = msg;
repl.on('exit', () => {
  console.log('Received "exit" event from repl!');
  process.exit();
});