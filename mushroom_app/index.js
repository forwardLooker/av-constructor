const fs = require('fs');
const rl = readline.createInterface({
  input: fs.createReadStream('input.txt'),
  crlfDelay: Infinity // Treats '\r\n' as a single newline
});

rl.on('line', (line) => {
  console.log(`Line from file: ${line}`);
});
