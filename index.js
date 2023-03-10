const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
            const result = await postCollection.find({}).sort({ createdAt: -1 }).toArray()
            res.send(result)
        })
        app.post('/posts', async (req, res) => {
            const post = req.body
            const result = await postCollection.insertOne(post)
            res.send(result)
        })
        app.get('/posts/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await postCollection.findOne(filter)
            res.send(result)
        })
        app.delete('/posts/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await postCollection.deleteOne(filter)
            res.send(result)
        })
        app.put('/posts/:id', async (req, res) => {
            const id = req.params.id
            const post = req.body
            const { title, content, updatedAt } = post
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    title, content, updatedAt
                }
            }
            const result = await postCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        //MY POST
        app.get('/my-posts', async (req, res) => {
            const email = req.query.email
            const filter = { authorEmail: email }
            const result = await postCollection.find(filter).sort({ createdAt: -1 }).toArray()
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
