const express = require('express');
const app = express();
const body = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
let imgfilename = '';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./upload/");
    },
    filename: function (req, file, cb) {
        imgfilename = Date.now() + file.originalname;
        return cb(null, imgfilename);
    }
});
const upload = multer({ storage: storage });

// create folder
// const upload = multer({dest:'./upload'})

const mainpath = path.join(__dirname, "../public");
app.use(express.static(mainpath));
app.use(express.static('upload'));
const imgmainpath = path.join(__dirname, "../upload");
app.set("view engine", "ejs");
const bodyparse = body.urlencoded({ extended: false });
const mongo = require('mongodb');

const mongoclient = mongo.MongoClient;

const url = "mongodb://127.0.0.1:27017/";

const client = new mongoclient(url);
let udata = '';
async function getdata() {

    try {
        await client.connect();
        console.log("connect to db");
        const db = client.db('userinfo')
        const collection = db.collection('userdata');
        var userdata = await collection.find({}).toArray();
        // insert new records
        app.get("/mydb", async (req, res) => {
            console.log("MYDB Request Called");
            udata = '';
            var userdata1 = await collection.find({}).toArray();
            res.render("index", {
                data: userdata1,
                udata: udata
            });
        });
        app.post('/savedata', upload.single('img'), async (req, res) => {
            console.log("Method SaveData Success");
            let id = req.body.id;
            console.log(imgfilename);
            if (id != '') {
                udata = '';
                udata = userdata.find((i) => {
                     return i.id == id;
                    
                });
                oldimagename = (udata.img!='') ? udata.img :"";
                if(req.file && imgfilename != ''){
                    let imgname ="upload/"+udata.img;
                    fs.unlink(imgname,() => {
                        console.log("image deleted");
                    });
                }
                let final = collection.updateOne({
                    id: id,
                }, {
                    $set: {
                        name: req.body.name,
                        age: req.body.age,
                        email: req.body.email,
                        address: req.body.address,
                        img: (req.file && imgfilename !='')?imgfilename:oldimagename 
                    }
                })
            } else {
                var data = {
                    id: (userdata.length + 1).toString(),
                    name: req.body.name,
                    age: req.body.age,
                    email: req.body.email,
                    address: req.body.address,
                    img: imgfilename
                }
                userdata.push(data);

                let result = await collection.insertOne(data);
                console.log(result);

            }
            res.redirect('mydb');
        });

        app.get('/del/:id', async (req, res) => {

            try {
                console.log("Method Delete Success");
                let id = req.params.id;
                let images = userdata.find((i) => {
                    return i.id == id;
                });
                if (typeof images == "undefined") {
                    console.log("No images found");
                } else {
                    let imgname = "upload/" + images.img
                    fs.unlink(imgname, () => {
                    })
    
                }
                await collection.deleteOne({ id: id });
                res.redirect('/mydb');
                 

            } catch (e) {
                console.log(e)
            }

        });
        app.get('/edit/:id', async (req, res) => {
            app.use(express.static(imgmainpath));
            userdata = await collection.find({}).toArray();
            let id = req.params.id;
            udata = userdata.find((i) => {
                return i.id == id;
            });
            console.log(udata);
            res.render("index", {
                udata: udata,
                data: userdata

            });

        });
    } catch (err) {
        console.log(err);
    }
}
getdata();
app.get('/', (req, res) => {
    console.log("Hello mongodb....");
});

app.listen(8005, "127.0.0.1", () => {
    console.log("listen on 8005...");
})
