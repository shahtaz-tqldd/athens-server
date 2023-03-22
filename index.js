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
        const opinionsCollection = client.db('athens').collection('opinions')

        //POSTS ===========================
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

        //MY WRITE UP
        app.get('/my-posts', async (req, res) => {
            const email = req.query.email
            const filter = { authorEmail: email }
            const result = await postCollection.find(filter).sort({ savedAt: -1 }).toArray()
            res.send(result)
        })

        // SAVE POST
        app.post('/posts/:id/save', async (req, res) => {
            const id = req.params.id;
            const userId = req.body.userId;
            const filter = { _id: new ObjectId(id) };

            try {
                const post = await postCollection.findOne(filter);

                if (!post) {
                    return res.status(404).json({ message: 'Post not found' });
                }

                if (post?.saves?.includes(userId)) {
                    await postCollection.updateOne(filter, { $pull: { saves: userId } });
                    res.json({ message: 'Saved post removed' });
                }
                else {
                    await postCollection.updateOne(filter, { $push: { saves: userId } });
                    res.json({ message: 'Post is Saved' });
                }
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
            }
        })
        app.get('/posts/save/:email', async (req, res) => {
            const savedBy = req.params.email
            const filter = {};
            const posts = await postCollection.find(filter).toArray()
            
            const savedPosts = []
            for (const post of posts) {
                if (post?.saves?.includes(savedBy)) {
                    savedPosts.push(post)
                }
            }
            res.send(savedPosts)
        })

        // OPINION
        app.post('/opinion/:id', async (req, res) => {
            // const id = req.params.id
            const opinion = req.body
            const result = await opinionsCollection.insertOne(opinion)
            res.send(result)
        })
        app.get('/opinion/:id', async (req, res) => {
            const id = req.params.id
            const filter = { postId: id }
            const result = await opinionsCollection.find(filter).sort({ opinionAt: -1 }).toArray()
            res.send(result)
        })
        app.delete('/opinion/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await opinionsCollection.deleteOne(filter)
            res.send(result)
        })
        app.put('/opinion/:id', async (req, res) => {
            const id = req.params.id
            const updated = req.body
            const { updatedOpinion, updatedAt } = updated
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    opinion: updatedOpinion,
                    updatedAt
                }
            }
            const result = await opinionsCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        // AGREE TO THE POST
        app.post('/posts/:id/agree', async (req, res) => {
            const id = req.params.id;
            const userId = req.body.userId;
            const filter = { _id: new ObjectId(id) };

            try {
                const post = await postCollection.findOne(filter);

                if (!post) {
                    return res.status(404).json({ message: 'Post not found' });
                }
                if (!post?.agrees?.includes(userId)) {
                    await postCollection.updateOne(filter, { $push: { agrees: userId } });
                    res.json({ message: 'Agreed to the post' });
                }

                else {
                    await postCollection.updateOne(filter, { $pull: { agrees: userId } });
                    res.json({ message: 'Agree removed' });
                }
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
            }
        });

    } finally { }
}
run().catch(err => console.error(err))

app.get('/', (req, res) => {
    res.send("Athens server is running...")
})

app.listen(port, () => {
    console.log(`Athens server is running on ${port}`)
})