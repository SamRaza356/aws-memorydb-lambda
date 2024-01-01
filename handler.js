const { IORedis } = require("./RedisService/redis.js");

module.exports.MemoryDBExample = async(event) => {
    const db = new IORedis();
    try {
       const surveyId = event.surveyId;
        const members = await db.smembers(`survey:${surveyId}`);

        await db.disconnect();
        return {
            statusCode: 200,
            body: JSON.stringify(members),
        };
    } catch (error) {
        console.log("Error:",error);
    }
};