const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1uor19o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const postCollection = client.db('athens').collection('posts')

        //posts ===========================
        app.get('/posts', async (req, res) => {
            const result = await postCollection.find({}).toArray()
            res.send(result)
        })

    } finally { }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send("Athens server is running...")
})

app.listen(port, () => {
    console.log(`Athens server is running on ${port}`)
})
