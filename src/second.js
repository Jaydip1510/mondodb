const express = require('express')

const mongo = require('mongodb')

const MongoClient = mongo.MongoClient

const app = express();
app.get('/',(req,res)=>{
    res.send("Hello Mongodb")
});

const url = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(url)

async function getdata(){
    try{
        await client.connect()

        console.log("Connect to db")
        const db = client.db('student');
        const collection = db.collection('product');
        const response = await collection.find({}).toArray();
        console.log(response);
    }
    catch(e){
        console.error(e)
    }
}

getdata()