require('dotenv').config();
const app = require('./app');
const { db } = require('./dataBase/config');
const initModel = require('./models/initModels');

db.authenticate()
  .then(() => console.log('database authenticated!'))
  .catch((error) => console.log(error));

initModel();

db.sync()
  .then(() => console.log('database synced! 😆'))
  .catch((error) => console.log(error));

const port = process.env.PORT || 3010;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
