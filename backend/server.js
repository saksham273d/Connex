let express = require('express')
let dotenv = require('dotenv')
let cors = require('cors')
let mongoose = require('mongoose')
let authRoutes = require('./routes/authRoutes')

let app = express();
let contactRoutes = require('./routes/contactRoutes')

dotenv.config();
app.use(cors({
  origin: ['http://localhost:5173', 'https://connex-rose.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json())

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('MongoDB Connected'))
.catch((err)=>console.log(err));

app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)

let PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))