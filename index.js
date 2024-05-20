const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["https://dahboad-chart-blackcoffer.vercel.app", "http://localhost:5173"]
}));
app.use(express.json());

// MongoDB Connection URI
const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();

    const db = client.db('Blackcoffer');
    const chartCollection = db.collection('chart');
    const userCollection = db.collection('user');
    const variableCollection = db.collection('variabledata');

    // API get method using
    app.get('/chart', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      try {
        const result = await chartCollection.find().skip(skip).limit(limit).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get('/variabledata', async (req, res) => {
      try {
        const result = await variableCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching variable data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // ------user--------
    app.get('/user', async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post('/user', async (req, res) => {
      const users = req.body;
      const query = { email: users.email };

      try {
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'User already exists', insertedId: null });
        }
        const result = await userCollection.insertOne(users);
        res.send(result);
      } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // ---------check database connect--------
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running');
});
