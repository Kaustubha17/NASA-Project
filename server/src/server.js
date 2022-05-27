const http = require('http');

require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');

const { loadPlanetsData } = require('../src/models/planets.model');
const { loadLaunchesData } = require('../src/models/launches.model');
const PORT = process.env.PORT || 8000;



const server = http.createServer(app);



async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();


}
startServer();
server.listen(PORT, () => { console.log(`Server listening at port ${PORT}`) });


// app.listen(PORT, () => { console.log(`Server listening at port ${PORT}`); });
