var configs = {
    development: {
        leaderMinionPort: 8081,
        trainingScheduleStrategy: "force",
        minionCreateStrategy: "force",
        coreApiEndpoint: "http://localhost:8083",
        mode: "sandbox"
    }, production: {
        leaderMinionPort: 8001,
        trainingScheduleStrategy: "force",
        minionCreateStrategy: "bestfit",
        coreApiEndpoint: "http://localhost:8083",
        mode: "sandbox"
    },
};


module.exports = configs;