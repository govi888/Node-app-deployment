const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello Automatic from Jenkins & PM2 deployed Node.js App!');
  res.send('AUTOMODE');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
