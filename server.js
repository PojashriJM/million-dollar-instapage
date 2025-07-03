const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'headerandfooter.html'));
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


app.post('/send-mail', upload.single('image'), (req, res) => {
  const { name, email, pixelInfo, url, company, paymentplatform } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).send("Image not uploaded");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'milliondollarinstapage2025@gmail.com',
      pass: 'utzp phrt hseq unrt'
    }
  });

  const mailOptions = {
    from: email,
    to: 'milliondollarinstapage2025@gmail.com',
    subject: `New Pixel Request from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>URL:</strong> ${url}</p>
      <p><strong>Payment Platform:</strong> ${paymentplatform}</p>
      <p><strong>Pixel Info:</strong><br><pre>${pixelInfo}</pre></p>
      <p><strong>Uploaded Image:</strong></p>
      <img src="cid:uploaded-image" width="150"/>
    `,
    attachments: [
      {
        filename: imageFile.originalname,
        path: imageFile.path,
        cid: 'uploaded-image' 
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    
    fs.unlink(imageFile.path, () => { });

    if (error) {
      console.error(error);
      res.status(500).send('Email failed to send');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Email sent successfully!');
    }
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});