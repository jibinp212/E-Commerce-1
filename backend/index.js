const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require('dotenv').config();

const port = 4000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb://localhost:27017/1-E-Commerce", {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Error connecting to MongoDB:', error);
});

app.get("/", (req, res) => {
    res.send("Express App is running");
});

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

app.use('/images', express.static('upload/images'));
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: String, required: true },
    old_price: { type: String, required: true },
    date: { type: Date },
    available: { type: Boolean, default: true },
});

app.post("/addproduct", async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    });
    await product.save();
    res.json({
        success: true,
        name: req.body.name
    });
});

app.post("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
        success: true,
        name: req.body.name,
    });
});

app.get("/allproducts", async (req, res) => {
    let products = await Product.find({});
    res.send(products);
});

const User = mongoose.model('User', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now },
    otp: { type: String },
    otpExpiry: { type: Date }
});

// Set up Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    });
};

app.post("/signup", async (req, res) => {
    let check = await User.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with same email address" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });
    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        const passMatch = req.body.password === user.password;
        if (passMatch) {
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();

            await sendOTPEmail(user.email, otp);

            res.json({ success: true, message: "OTP sent to your email" });
        } else {
            res.json({ success: false, errors: "wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "wrong email address" });
    }
});

app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    let user = await User.findOne({ email: email });

    if (!user) {
        return res.status(400).json({ success: false, errors: "User not found" });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
        return res.status(400).json({ success: false, errors: "Invalid or expired OTP" });
    }

    const data = {
        user: {
            id: user.id
        }
    };
    const token = jwt.sign(data, 'secret_Ecom');
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, token });
});

app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
});

app.get('/popularproducts', async (req, res) => {
    let products = await Product.find({ category: "men" });
    let popularproducts = products.slice(0, 4);
    res.send(popularproducts);
});

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "please authenticate using valid login" });
    }
    try {
        const data = jwt.verify(token, "secret_ecom");
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ errors: "please authenticate using a valid token" });
    }
};

app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await User.findOne({ _id: req.user.id });
    if (!userData) {
        return res.status(404).json({ errors: "User not found" });
    }

    userData.cartData[req.body.itemId] += 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("added");
});

app.post("/removefromcart", fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId)
    let userData = await User.findOne({ _id: req.user.id });
    if (!userData) {
        return res.status(404).json({ errors: "User not found" });
    }

    if (userData.cartData[req.body.itemId] > 0)
        userData.cartData[req.body.itemId] -= 1;
    await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed");
    
});

app.post("/getcart", fetchUser, async (req, res) => {
    let userData = await User.findOne({ _id: req.user.id });

    if (!userData) {
        return res.status(404).json({ errors: "User not found"});
    }
    res.json(userData.cartData);
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/createOrder", async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_order_74394"
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send("Error creating Razorpay order");
    }
});

app.post("/verifyPayment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


// ----------------- aboove last code  
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const cors = require("cors");
// const port = 4000;

// app.use(express.json());
// app.use(cors());

// mongoose.connect("mongodb://localhost:27017/1-E-Commerce", {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
// }).then(() => {
//     console.log('Connected to MongoDB');
// }).catch((error) => {
//     console.log('Error connecting to MongoDB:', error);
// });

// app.get("/", (req, res) => {
//     res.send("Express App is running");
// });

// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb) => {
//         cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
//     }
// });

// const upload = multer({ storage: storage });

// app.use('/images', express.static('upload/images'));
// app.post("/upload", upload.single('product'), (req, res) => {
//     res.json({
//         success: 1,
//         image_url: `http://localhost:${port}/images/${req.file.filename}`
//     });
// });

// const Product = mongoose.model("Product", {
//     id: {
//         type: Number,
//         required: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     new_price: {
//         type: String,
//         required: true
//     },
//     old_price: {
//         type: String,
//         required: true
//     }, 
//     date: {
//         type: Date,
//     },
//     availbale: {
//         type: Boolean,
//         default: true,
//     },
// });

// app.post("/addproduct", async (req, res) => {
//     let products = await Product.find({});
//     let id;
//     if(products.length > 0){
//         let last_product_array = products.slice(-1);
//         let last_product = last_product_array[0];
//         id = last_product.id + 1;
//     } else {
//         id = 1;
//     }

//     const product = new Product({
//         id: id,
//         name: req.body.name,
//         image: req.body.image,
//         category: req.body.category,
//         new_price: req.body.new_price,
//         old_price: req.body.old_price
//     });
//     console.log(product);
//     await product.save();
//     console.log("save")
//     res.json({
//         success: true,
//         name: req.body.name
//     });
// });

// app.post("/removeproduct", async(req,res) =>{
//     await Product.findOneAndDelete({id:req.body.id});
//     console.log("removed",req.body);
//     res.json({
//         success:true,
//         name:req.body.name,
//     });
// });

// app.get("/allproducts", async (req,res) => {
//     let products = await Product.find({});
//     console.log("all products fetched");
//     res.send(products);
// });

// const User = mongoose.model('User', {
//     name:{
//         type:String,
//     },
//     email:{
//         type:String,
//         unique:true,
//     },
//     password:{
//         type:String,
//     },
//     cartData:{
//         type:Object
//     },
//     date:{
//         type:Date,
//         default:Date.now,
//     }
// });

// app.post("/signup", async (req,res) => {
//     let check = await User.findOne({email: req.body.email});
//     if(check){
//         return res.status(400).json({success: false, errors: "existing user found with same email address"});
//     }
//     let cart = {};
//     for (let i = 0; i < 300; i++){
//         cart[i] = 0;
//     }
//     const user = new User({
//         name: req.body.username,
//         email: req.body.email,
//         password: req.body.password,
//         cartData: cart,
//     });
//     await user.save();

//     const data = {
//         user: {
//             id: user.id
//         }
//     }
//     const token = jwt.sign(data, "secret_ecom");
//     res.json({success: true, token});
// });

// app.post("/login", async (req,res) => {
//     let user = await User.findOne({email: req.body.email});
//     if(user) {
//         const passMatch = req.body.password === user.password;
//         if(passMatch){
//             const data = {
//                 user: {
//                     id: user.id
//                 }
//             }
//             const token = jwt.sign(data, 'secret_Ecom');
//             res.json({success: true, token});
//         } else {
//             res.json({success: false, errors: "wrong Password"});
//         }
//     } else {
//         res.json({success: false, errors: "wrong email address"});
//     }
// });

// app.get('/newcollections', async (req,res) => {
//     let products = await Product.find({});
//     let newcollection = products.slice(1).slice(-8);
//     console.log("New Collection Fetched");
//     res.send(newcollection);
// });

// app.get('/popularproducts', async (req,res) => {
//     let products = await Product.find({category:"men"});
//     let popularproducts = products.slice(0,4);
//     console.log("popular products fetched");
//     res.send(popularproducts);
// });

// const fetchUser = async (req,res,next) => {
//     const token = req.header('auth-token');
//     if(!token){
//         return res.status(401).send({errors: "please authenticate using valid login"});
//     }
//     try {
//         const data = jwt.verify(token, "secret_ecom");
//         req.user = data.user;
//         next();
//     } catch (error) {
//         return res.status(401).send({errors: "please authenticate using a valid token"});
//     }
// };

// app.post('/addtocart', fetchUser, async (req,res) => {
//     console.log("Added", req.body.itemId);

//     let userData = await User.findOne({_id: req.user.id});
//     if (!userData) {
//         return res.status(404).json({errors: "User not found"});
//     }

//     userData.cartData[req.body.itemId] += 1;
//     await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
//     res.send("added");
// });

// app.post("/removefromcart", fetchUser, async (req,res) => {
//     console.log("removed", req.body.itemId);
//     let userData = await User.findOne({_id: req.user.id});
//     if (!userData) {
//         return res.status(404).json({errors: "User not found"});
//     }

//     if(userData.cartData[req.body.itemId] > 0)
//         userData.cartData[req.body.itemId] -= 1;
//     await User.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
//     res.send("Removed");
// });

// app.post("/getcart", fetchUser, async (req, res) => {
//     console.log("get cart");
//     let userData = await User.findOne({ _id: req.user.id });

//     if (!userData) {
//         return res.status(404).json({ errors: "User not found" });
//     }

//     res.json(userData.cartData);
// });

// app.listen(port, (error) => {
//     if (!error) {
//         console.log("Server is Running on port " + port);
//     } else {
//         console.log("Error: " + error);
//     }
// });



// const express = require("express");

// const app = express();
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const cors = require("cors");
// const { type } = require("os");
// const port = 4000;

// app.use(express.json());
// app.use(cors());

// // database connection 
// // mongoose.connect("mongodb://ecommerceMern:user123@ac-k3jlquy-shard-00-00.4s29uax.mongodb.net:27017,ac-k3jlquy-shard-00-01.4s29uax.mongodb.net:27017,ac-k3jlquy-shard-00-02.4s29uax.mongodb.net:27017/ecommerce-mern?ssl=true&replicaSet=atlas-mab8yj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0", {
// mongoose.connect("mongodb://localhost:27017/1-E-Commerce", {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
// }).then(() => {
//     console.log('Connected to MongoDB');
// }).catch((error) => {
//     console.log('Error connecting to MongoDB:', error);
// });

// // api creation  
// app.get("/", (req, res) => {
//     res.send("Express App is running");
// });

// // image storage  
// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb) => {
//         cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
//     }
// });

// const upload = multer({ storage: storage });

// // creating upload  
// app.use('/images', express.static('upload/images'));
// app.post("/upload", upload.single('product'), (req, res) => {
//     res.json({
//         success: 1,
//         image_url: `http://localhost:${port}/images/${req.file.filename}`
//     })
// })

// // schema creating  
// const Product = mongoose.model("Product", {
//     id: {
//         type: Number,
//         required: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     new_price: {
//         type: String,
//         required: true
//     },
//     old_price: {
//         type: String,
//         required: true
//     }, date: {
//         type: Date,
//     },
//     availbale: {
//         type: Boolean,
//         default: true,
//     },
// })

// // creating default api
// app.post("/addproduct", async (req, res) => {
//     let products = await Product.find({});
//     let id;
//     if(products.length > 0){
//         let last_product_array = products.slice(-1);
//         let last_product = last_product_array[0];
//         id = last_product.id +1;
//     } else {
//         id=1;
//     }

//     const product = new Product({
//         id: id,
//         name: req.body.name,
//         image: req.body.image,
//         category: req.body.category,
//         new_price: req.body.new_price,
//         old_price:req.body.old_price
//     });
//     console.log(product);
//     await product.save();
//     console.log("save")
//     res.json({
//         success: true,
//         name: req.body.name
//     });
// })

// // creation api for all products 
// app.post("/removeproduct", async(req,res) =>{
//     await Product.findOneAndDelete({id:req.body.id});
//     console.log("removed",req.body);
//     res.json({
//         success:true,
//         name:req.body.name,
//     })
// })

// // creating api for all products  
// app.get("/allproducts", async (req,res) => {
//     let products = await Product.find({})
//         console.log("all products fetched ")
//         res.send(products)
// })

// const User = mongoose.model('User', {
//     name:{
//         type:String,
//     },
//     email:{
//         type:String,
//         unique:true,
//     },
//     password:{
//         type:String,
//     },
//     cartData:{
//           type:Object
//     },
//     date:{
//         type:Date,
//         default:Date.now,

//     }
// })

// // creating endpoint reg  
// app.post("/signup", async (req,res) => {
//     let check = await  User.findOne({email: req.body.email});
//     if(check){
//         return res.status(400).json({success: false, errors: "existing user found with same emaail address "})
//     }
//     let cart = {};
//     for (let i = 0; i<300;i++){
//         cart[i]=0;
//     }
//     const user = new User({
//         name:req.body.username,
//         email:req.body.email,
//         password:req.body.password,
//         cartData:cart,
//     })
//     await user.save();

//     const data = {
//          user : {
//             id:user.id
//          }
//     }
//     const token = jwt.sign(data, "secret_ecom");
//     res.json({success:true, token})
// })

// // creating endpoint user login   
// app.post("/login", async (req,res) => {
//     let user = await User.findOne({email:req.body.email});
//     if(user) {
//         const passMatch = req.body.password === user.password;
//         if(passMatch){
//             const data = {
//                 user: {
//                     id: user.id
//                 }
//             }
//             const token = jwt.sign(data, 'secret_Ecom ');
//             res.json({success:true,token});
//         }else{
//             res.json({success:false, errors:"wrong Password "});
//         }
//     }else{
//         res.json({success:false, errors:"wrong email address"})
//     }
// })

// // creating end Point for latest product 
// app.get('/newcollections', async (req,res) => {
//     let products = await Product.find({});
//     let newcollection = products.slice(1).slice(-8);
//     console.log("New Collection Fetched ")
//     res.send(newcollection);
// })

// // creating endpoint for popular products 
// app.get('/popularproducts', async (req,res) => {
//     let products = await Product.find({category:"men"});
//     let popularproducts = products.slice(0,4);
//     console.log("popular products fetched")
//     res.send(popularproducts)
// })


// // creating middlewares 
// const fetchUser = async (req,res,next) => {
//     const token = req.header ('auth-token');
//     if(!token){
//         res.status(401).send({errors: "please authenticate using valid login"})
//     }else {
//         try {
//             const data = jwt.verify(token, "secret_ecom");
//             req.user = data.user;
//             next()
//         }catch (error){
//             res.status(401).send({errors: "please authenticate using a valid token "});
//         }
//     }
// }   
// // creating end addproducts 
// app.post('/addtocart', fetchUser, async (req,res) => {
//     console.log("Added", req.body.itemId)

//     let userData = await User.findOne({_id: req.user.id})
//     userData.cartData[req.body.itemId] += 1;
//     await User.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
//     res.send("added")
// })

// // creating end point of 
// app.post("/removefromcart", fetchUser , async (req,res) => {
//     console.log("removed", req.body.itemId)
//     let userData = await User.findOne({_id: req.user.id})
//    if( userData.cartData[req.body.itemId] >0)
//     userData.cartData[req.body.itemId] -= 1;
//     await User.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
//     res.send("Removed ")
// })

// // app.post("/getcart",fetchUser, async (req,res)=> {
// //     console.log("get cart");
// //     let userData = await User.findOne({_id: req.user.id});
// //     res.json(userData.cartData);
// // })
// app.post("/getcart", fetchUser, async (req, res) => {
//     console.log("get cart");
//     let userData = await User.findOne({ _id: req.user.id });

//     if (!userData) {
//         return res.status(404).json({ errors: "User not found" });
//     }

//     res.json(userData.cartData);
// });



// Create Razorpay order --------------
// app.post('/createOrder', fetchUser, async (req, res) => {
//     const amount = req.body.amount;
//     const options = {
//         amount: amount * 100, 
//         currency: "INR",
//         receipt: `receipt_${Date.now()}`
//     };
//     try {
//         const order = await razorpayInstance.orders.create(options);
//         res.json(order);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// // Verify Razorpay payment
// app.post('/verifyPayment', fetchUser, async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto.createHmac('sha256', 'YOUR_RAZORPAY_KEY_SECRET')
//         .update(body.toString())
//         .digest('hex');
    
//     if (expectedSignature === razorpay_signature) {
//         res.json({ success: true });
//     } else {
//         res.status(400).json({ success: false });
//     }
// });
// ----------------------

// app.listen(port, (error) => {
//     if (!error) {
//         console.log("Server is Running on port " + port);
//     } else {
//         console.log("Error: " + error);
//     }
// });


// const express = require("express");
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const cors = require("cors");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// require('dotenv').config();

// const port = 4000;
// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// mongoose.connect("mongodb://localhost:27017/1-E-Commerce", {
// }).then(() => {
//     console.log('Connected to MongoDB');
// }).catch((error) => {
//     console.log('Error connecting to MongoDB:', error);
// });

// app.get("/", (req, res) => {
//     res.send("Express App is running");
// });

// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb) => {
//         cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
//     }
// });

// const upload = multer({ storage: storage });

// app.use('/images', express.static('upload/images'));
// app.post("/upload", upload.single('product'), (req, res) => {
//     res.json({
//         success: 1,
//         image_url: `http://localhost:${port}/images/${req.file.filename}`
//     });
// });

// const Product = mongoose.model("Product", {
//     id: { type: Number, required: true },
//     name: { type: String, required: true },
//     image: { type: String, required: true },
//     category: { type: String, required: true },
//     new_price: { type: String, required: true },
//     old_price: { type: String, required: true },
//     date: { type: Date },
//     available: { type: Boolean, default: true },
// });

// app.post("/addproduct", async (req, res) => {
//     let products = await Product.find({});
//     let id;
//     if (products.length > 0) {
//         let last_product_array = products.slice(-1);
//         let last_product = last_product_array[0];
//         id = last_product.id + 1;
//     } else {
//         id = 1;
//     }

//     const product = new Product({
//         id: id,
//         name: req.body.name,
//         image: req.body.image,
//         category: req.body.category,
//         new_price: req.body.new_price,
//         old_price: req.body.old_price
//     });
//     await product.save();
//     res.json({
//         success: true,
//         name: req.body.name
//     });
// });

// app.post("/removeproduct", async (req, res) => {
//     await Product.findOneAndDelete({ id: req.body.id });
//     res.json({
//         success: true,
//         name: req.body.name,
//     });
// });

// app.get("/allproducts", async (req, res) => {
//     let products = await Product.find({});
//     res.send(products);
// });

// const User = mongoose.model('User', {
//     name: { type: String },
//     email: { type: String, unique: true },
//     password: { type: String },
//     cartData: { type: Object },
//     date: { type: Date, default: Date.now },
//     otp: { type: String },
//     otpExpiry: { type: Date }
// });

// // Set up Nodemailer
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// // Function to generate OTP
// const generateOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Function to send OTP via email
// const sendOTPEmail = async (email, otp) => {
//     await transporter.sendMail({
//         from: process.env.EMAIL,
//         to: email,
//         subject: 'Your OTP Code',
//         text: `Your OTP code is ${otp}`
//     });
// };

// app.post("/signup", async (req, res) => {
//     let check = await User.findOne({ email: req.body.email });
//     if (check) {
//         return res.status(400).json({ success: false, errors: "existing user found with same email address" });
//     }
//     let cart = {};
//     for (let i = 0; i < 300; i++) {
//         cart[i] = 0;
//     }
//     const user = new User({
//         name: req.body.username,
//         email: req.body.email,
//         password: req.body.password,
//         cartData: cart,
//     });
//     await user.save();

//     const data = {
//         user: {
//             id: user.id
//         }
//     }
//     const token = jwt.sign(data, "secret_ecom");
//     res.json({ success: true, token });
// });

// app.post("/login", async (req, res) => {
//     let user = await User.findOne({ email: req.body.email });
//     if (user) {
//         const passMatch = req.body.password === user.password;
//         if (passMatch) {
//             const otp = generateOTP();
//             const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

//             user.otp = otp;
//             user.otpExpiry = otpExpiry;
//             await user.save();

//             await sendOTPEmail(user.email, otp);

//             res.json({ success: true, message: "OTP sent to your email" });
//         } else {
//             res.json({ success: false, errors: "wrong Password" });
//         }
//     } else {
//         res.json({ success: false, errors: "wrong email address" });
//     }
// });

// app.post("/verify-otp", async (req, res) => {
//     const { email, otp } = req.body;
//     let user = await User.findOne({ email: email });

//     if (!user) {
//         return res.status(400).json({ success: false, errors: "User not found" });
//     }

//     if (user.otp !== otp || new Date() > user.otpExpiry) {
//         return res.status(400).json({ success: false, errors: "Invalid or expired OTP" });
//     }

//     const data = {
//         user: {
//             id: user.id
//         }
//     };
//     const token = jwt.sign(data, 'secret_Ecom');
//     user.otp = null;
//     user.otpExpiry = null;
//     await user.save();

//     res.json({ success: true, token });
// });

// app.get('/newcollections', async (req, res) => {
//     let products = await Product.find({});
//     let newcollection = products.slice(1).slice(-8);
//     res.send(newcollection);
// });

// app.get('/popularproducts', async (req, res) => {
//     let products = await Product.find({ category: "men" });
//     let popularproducts = products.slice(0, 4);
//     res.send(popularproducts);
// });

// const fetchUser = async (req, res, next) => {
//     const token = req.header('auth-token');
//     if (!token) {
//         return res.status(401).send({ errors: "please authenticate using valid login" });
//     }
//     try {
//         const data = jwt.verify(token, "secret_ecom");
//         req.user = data.user;
//         next();
//     } catch (error) {
//         return res.status(401).send({ errors: "please authenticate using a valid token" });
//     }
// };

// app.post('/addtocart', fetchUser, async (req, res) => {
//     let userData = await User.findOne({ _id: req.user.id });
//     if (!userData) {
//         return res.status(404).json({ errors: "User not found" });
//     }

//     userData.cartData[req.body.itemId] += 1;
//     await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
//     res.send("added");
// });

// app.post("/removefromcart", fetchUser, async (req, res) => {
//     console.log("removed", req.body.itemId)
//     let userData = await User.findOne({ _id: req.user.id });
//     if (!userData) {
//         return res.status(404).json({ errors: "User not found" });
//     }

//     if (userData.cartData[req.body.itemId] > 0)
//         userData.cartData[req.body.itemId] -= 1;
//     await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
//     res.send("Removed");
// });

// app.post("/getcart", fetchUser, async (req, res) => {
//     let userData = await User.findOne({ _id: req.user.id });

//     if (!userData) {
//         return res.status(404).json({ errors: "User not found"});
//     }
//     res.json(userData.cartData);
// });

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// app.post("/createOrder", fetchUser, async (req, res) => {
//     const { amount } = req.body;

//     try {
//         const options = {
//             amount: amount * 100,
//             currency: "INR",
//             receipt: "receipt_order_74394"
//         };
//         const order = await razorpay.orders.create(options);
//         res.json(order);
//     } catch (error) {
//         res.status(500).send("Error creating Razorpay order");
//     }
// });

// app.post("/verifyPayment", fetchUser, async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(body.toString())
//         .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//         res.json({ success: true });
//     } else {
//         res.status(400).json({ success: false });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });
