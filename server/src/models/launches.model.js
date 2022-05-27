// const launches = require('./launches.mongo');

const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

// const launches = new Map();
// let latesFlightNumber = 100;


// launches.set(launch.flightNumber, launch);

const DEFAULT_FLIGHTNUMBER = 100;

async function getLatestFlightNumber() {
    // sorting flights in descending order and taking the first one

    const latestLaunch = await launches.findOne().sort('-flightNumber');
    if (!latestLaunch) {
        return DEFAULT_FLIGHTNUMBER;
    } else {

        return latestLaunch.flightNumber;
    }
}

async function getAllLaunches(skip, limit) {
    return await (launches.find({}, { "__v": 0, "_id": 0 }))
        .skip(skip).limit(limit).sort({ flightNumber: 1 });
}

async function saveLaunch(launch) {

    return await launches.findOneAndUpdate({ flightNumber: launch.flightNumber }, launch, { upsert: true });

}



async function scheduleNewLaunch(launch) {
    const planet = await planets.find({ "kepler_name": launch.target });

    if (planet.length === 0) {
        throw new Error('No matching planet found');
    }



    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        customers: ['ZTM', 'NASA'],
        upcoming: true,
        success: true,
    })
    await saveLaunch(newLaunch);
}


async function existsLaunchWithId(launchId) {
    return await findLaunch({ flightNumber: launchId });
}

async function abortLaunchById(launchId) {
    const aborted = await launches.findOneAndUpdate({ flightNumber: launchId }, {
        upcoming: false, success: false
    });
    // aborted.upcoming = false;
    // aborted.success = false;

    return aborted;

}
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log("Downloading data");


    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [

                {

                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });
    if (response.status != 200) {
        console.log('Problem downloading launch');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers

        }
        console.log(`${launch.flightNumber}    ${launch.mission}   ${launch.customers}`);

        await saveLaunch(launch);
    }
}

async function loadLaunchesData() {
    const firstLaunch = await (findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    }))
    // console.log(firstLaunch);
    if (firstLaunch) {
        console.log("Launch data already exists");
        return;
    }
    else {
        await populateLaunches();
    }




}
// loadLaunchesData();

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

module.exports = {

    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
    loadLaunchesData

}