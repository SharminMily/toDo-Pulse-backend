const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jzgy2jc.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("toDoPulseDb").collection("users");
    const TaskCollection = client.db("toDoPulseDb").collection("tasks");


    app.post('/users', async(req, res) => {
        const user = req.body;
        console.log(('new user', user))
        const result = await userCollection.insertOne(user);
        res.send(result);
    })

     // tasks api
     app.get('/tasks', async (req, res) => {
        const result = await TaskCollection.find().toArray();
        res.send(result);
      })   

    app.post('/tasks', async(req, res) => {
        const task = req.body;
        // console.log(('new task', task))
        const result = await TaskCollection.insertOne(task);
        res.send(result);
    })

      // update 
      app.get('/tasks/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await TaskCollection.findOne(query);
        res.send(result);
      })

      
    // put   
    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedTasks = req.body;

      const tasks = {
          $set: {
              name: updatedTasks.name,
              selected: updatedTasks.selected,              
              date:updatedTasks.date,
              text: updatedTasks.text                        
          }
      }

      const result = await TaskCollection.updateOne(filter, tasks, options);
      res.send(result);
  })

    
    //delete
    app.delete('/tasks/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await TaskCollection.deleteOne(query);
      res.send(result);
    }) 
   

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('todo pulse is running')
})

app.listen(port, () => {
    console.log(`todo pulse server is  running on port ${port}`)
}) 