require("dotenv").config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();


const db = process.env.MONGODB_URI;

mongoose.connect(db).then(() => {
    console.log("Connected to Database");
}).catch((error) => {
    console.log(error)
});

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

const userModel = require('./database/userSchema');

app.get("/", (req, res) => {


    // arr = ["Kaine Whitmore",
    //     "Nabila Sanders",
    //     "Gregor Davie",
    //     "Maeve Watkins",
    //     "Enrico Bullock",
    //     "Yehuda Olson",
    //     "Aoife Chandler",
    //     "Thelma Burnett",
    //     "Uwais Doyle",
    //     "Killian Bowers",
    //     "Madelaine Woolley",
    //     "Ailsa Grimes",
    //     "Maizie Pugh",
    //     "Momina Wynn",
    //     "Waqar Parrish",
    //     "Adelle Lugo",
    //     "Christina Henderson",
    //     "Shahzaib Hough",
    //     "Kelsey Hoover",
    //     "Phyllis Manning"
    // ];


    // const gen = ["men","women"]
    // for (i = 0; i < 20; i++) {
    //     const obj = new userModel({
    //         name: arr[i],
    //         email: `${(arr[i].toLowerCase()).split(" ").join("")}${Math.floor((Math.random() * 100) + 1)}@gmail.com`,
    //         amount: `${Math.floor((Math.random() * 100))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 100))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}`,
    //         phone: `+1 ${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}-${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}-${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}`,
    //         image: `https://randomuser.me/api/portraits/thumb/${gen[Math.floor((Math.random() * 2))]}/${Math.floor((Math.random() * 100))}.jpg`
    //     });
    // console.log(obj);
    // obj.save().then(()=>{console.log("added")});
    // }

    res.render("home");
});

app.get("/customer", async (req, res) => {
    const userData = await userModel.find().then((data) => {
        return (data)
    }).catch((error) => {
        return (error)
    });
    // console.log(userData);
    res.render("customer", {
        userData: userData
    });
});

app.get("/getData/:id", async (req, res) => {
    const user = await userModel.findOne({
        _id: req.params.id
    }).then(data => data).catch(err => err);
    res.send(user);
});


app.get("/userinfo/:user", async (req, res) => {
    const user = await userModel.findOne({
        _id: req.params.user
    }).then(data => data).catch(err => err);
    // console.log(user);
    // console.log(req.params.user)
    // console.log(user.transactions.length);
    if (user.transactions.length !== 0) {

    }
    res.render("userinfo", {
        user: user
    })
});

app.get("/transaction/:user", async (req, res) => {
    const user = await userModel.findOne({
        _id: req.params.user
    }).then(data => data).catch(err => err);

    // const dbaccess = await axios.get("http://localhost:3000/allUserDB").then(res => res.data).catch(err => err);
    const dbaccess = await axios.get("https://protected-wave-98167.herokuapp.com/allUserDB").then(res => res.data).catch(err => err);

    res.render("transaction", {
        user: user,
        db: dbaccess,
    })
})


app.post("/pay", async (req, res) => {
    console.log(req.body);
    if (parseInt(req.body.from_amount) >= parseInt(req.body.to_amount)) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();


        var d = new Date(),
            h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
            m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

        today = mm + '/' + dd + '/' + yyyy + " ," + h + ':' + m;

        const from_transaction = {
            transactionAmount: req.body.to_amount,
            date: today,
            message: req.body.msg,
            sender: req.body.from_id,
            sender_name: req.body.from_name,
            recipient: req.body.to_id,
            recipient_name: req.body.to_name,
            to: true,
        }
        const to_transaction = {
            transactionAmount: req.body.to_amount,
            date: today,
            message: req.body.msg,
            sender: req.body.from_id,
            sender_name: req.body.from_name,
            recipient: req.body.to_id,
            recipient_name: req.body.to_name,
            from: true,
        }

        const to_user = await userModel.findOne({
            _id: req.body.to_id
        }).then(data => data).catch(err => err);


        await userModel.updateOne({
            _id: req.body.from_id
        }, {
            $push: {
                transactions: from_transaction
            }
        }).then(res => console.log(res)).catch(err => console.log(err));

        await userModel.updateOne({
            _id: req.body.from_id
        }, {
            $set: {
                amount: (parseInt(req.body.from_amount) - parseInt(req.body.to_amount))
            }
        }).then(res => console.log(res)).catch(err => console.log(err));


        await userModel.updateOne({
            _id: req.body.to_id,
        }, {
            $push: {
                transactions: to_transaction
            }
        }).then(res => console.log(res)).catch(err => console.log(err));



        await userModel.updateOne({
            _id: req.body.to_id
        }, {
            $set: {
                amount: (parseInt(req.body.to_amount) + parseInt(to_user.amount))
            }
        }).then(res => console.log(res)).catch(err => console.log(err));

        res.render("status",{status:"made succesfully !"});
    }else{
        res.render("status",{status : "Failed due to Insufficient Balance !"});
    }


});

// app.get("/status", async (req, res) => {
//     res.render("status");
// })

const PORT = process.env.PORT || 3000;

app.listen(PORT, (req, res) => {
    console.log(`Server started on port ${PORT}`);
});