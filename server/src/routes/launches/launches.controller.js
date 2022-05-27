const { getAllLaunches, scheduleNewLaunch, existsLaunchWithId, abortLaunchById } = require('../../models/launches.model');
const { getPagination } = require('../../services/query')

async function httpGetAllLaunches(req, res) {
    // console.log(req.query);
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);
    // const launches = await getAllLaunches();

    return res.status(200).json(launches);
    // console.log(Array.from(launches.values()));
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: "Missing required launch property",
        });
    }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Invalid date",
        });
    }

    await scheduleNewLaunch(launch);
    console.log(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);

    // if launch doesnt' exist
    if (! await existsLaunchWithId(launchId)) {

        return res.status(404).json({
            error: 'Launch not found',
        })
    }

    // if launch does exist
    else {
        console.log("Inside else statement");
        const aborted = await abortLaunchById(launchId);
        return res.status(200).json(aborted);
    }
}
module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch, };

