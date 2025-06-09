const express = require('express');

const { ServerConfig } = require('./config');
const  Crons  = require('./utils/common/cron-jobs')
const apiRoutes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    Crons;
});
