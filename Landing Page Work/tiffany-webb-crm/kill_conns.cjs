const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@rishil8124shah'
});

connection.query('SHOW PROCESSLIST', (err, results) => {
  if (err) { console.error(err); process.exit(1); }
  let killed = 0;
  results.forEach(row => {
    if (row.Command === 'Sleep') {
      connection.query(`KILL ${row.Id}`);
      killed++;
    }
  });
  console.log(`Killed ${killed} sleeping connections`);
  setTimeout(() => process.exit(0), 1000);
});
