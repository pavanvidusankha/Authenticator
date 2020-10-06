const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require("fs");
var multer = require('multer');
app.use(express.static(__dirname + '/uploader'));
app.use(cors()); //Enables CORS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//retrieve the app credentials
const credentials = require('./credentials.json');

//initializing the credential details 
const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
var code;

//setting the oAuth client
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file']

//set multer upload properties 
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads'); //save the file to the "uploads" sub directory for temporary 
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + ".jpg"); //save the file including the uploaded epoch time
  }
});

var upload = multer({ storage: storage }).single('photo');

app.get('/', (req, res) => {

  code = req.query.code;
  console.log(code);
  //redirect to the upload file page
  res.sendFile(path.join(__dirname + '/uploader/upload.html'));
})

//Upload POST Request
app.post('/upload', async (req, res) => {

  if (code == null) return res.status(400).send('Invalid Request');

  //get the auth token from the auth server 
  const { tokens } = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(tokens);

  upload(req, res, function (err) {
    if (err) {
      return res.end("Error uploading file.");
    }
    //redirect to the success page
    res.sendFile(path.join(__dirname + '/uploader/success.html'));

    console.log(req.file.path);
    
    //drive authorization
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    //setting the data ready for the upload request
    const fileMetadata = {
      name: req.file.filename,
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    //upload the file
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
        fields: "id",
      },
      (err, file) => {
        if (err) {
          // Handle error
          console.error(err);
        } else {

          //after the successful upload,uploaded file must be deleted
          fs.unlinkSync(req.file.path)

        }

      }
    );

  });

});

app.listen(port, (req, res) => {

  console.log(`AuthServer running at http://localhost:${port}`)

})