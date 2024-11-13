const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect('mongodb+srv://gnani:gnani@cluster0.jimeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Patient Schema and Model
const patientSchema = new mongoose.Schema({
    name: String,
    gender: String,
    examDate: Date,
    address: String,
    mrNo: String,
    mobileNo: String,
    age: Number,
    complaint: String,
    rightEyePower: String,
    leftEyePower: String,
    addPower: String,
    diagnosis: String
});

const Patient = mongoose.model('Patient', patientSchema);

// Route to save patient data
app.post('/submitPatientData', async (req, res) => {
    try {
        const patientData = new Patient(req.body);
        await patientData.save();
        res.redirect('/receipt.html');
    } catch (error) {
        res.status(500).send("Error saving data.");
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
