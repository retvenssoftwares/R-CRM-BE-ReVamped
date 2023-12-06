
const MongoClient = require('mongodb').MongoClient;

async function countDocumentsInEveryMonth(date) {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db('your_database_name');
        const collection = database.collection('your_collection_name');

        const startDate = new Date(date);
        startDate.setDate(1); // Set the date to the first day of the month
        const endDate = new Date(date);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Set the date to the last day of the month

        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    count: { $sum: 1 }
                }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();

        console.log(`Number of documents in each month:`);
        result.forEach((month) => {
            console.log(`${month._id}: ${month.count}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

countDocumentsInEveryMonth('2022-07-01');
