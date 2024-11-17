const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const twilio = require('twilio');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://gnani:gnani@cluster0.jimeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

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

// Twilio Credentials
const accountSid = 'ACf8f45fc447fdd5ea3998ccf808976cc5';
const authToken = '4fcb2ac0769c62eed498e4d6d979fc87';
const client = twilio(accountSid, authToken);

app.post('/submitPatientData', async (req, res) => {
    try {
        const patientData = new Patient(req.body);

        // Ensure the phone number starts with +91
        if (!patientData.mobileNo.startsWith('+')) {
            patientData.mobileNo = `+91${patientData.mobileNo}`;
        }

        await patientData.save();

        // Compose SMS message
        const message = `
                Sri Satya Eye Care Receipt:
                Name: ${patientData.name}
                Gender: ${patientData.gender}
                Age: ${patientData.age}
                Address: ${patientData.address}
                MR No: ${patientData.mrNo}
                Mobile No: ${patientData.mobileNo}
                Exam Date: ${new Date(patientData.examDate).toLocaleDateString()}
                Chief Complaint: ${patientData.complaint}
                Right Eye Power: ${patientData.rightEyePower}
                Left Eye Power: ${patientData.leftEyePower}
                Add Power: ${patientData.addPower}
                Diagnosis: ${patientData.diagnosis}

                Thank you for choosing Sri Satya Eye Care!
                `;

        // Send SMS using Twilio
        client.messages
            .create({
                body: message,
                from: '+15023834008', // Your Twilio number
                to: patientData.mobileNo // Patient's mobile number
            })
            .then(() => {
                console.log('SMS sent successfully.');
            })
            .catch((err) => {
                console.error('Failed to send SMS:', err.message);
            });

        // Pass the saved data to the receipt page as query parameters
        const queryParams = new URLSearchParams(req.body).toString();
        res.redirect(`/receipt.html?${queryParams}`);
    } catch (error) {
        console.error('Error saving data or sending SMS:', error.message);
        res.status(500).send("Error saving data.");
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
