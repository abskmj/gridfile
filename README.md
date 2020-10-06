![npm](https://img.shields.io/npm/v/gridfile?label=NPM) ![NPM](https://img.shields.io/npm/l/gridfile?label=License) ![npm](https://img.shields.io/npm/dt/gridfile?label=Downloads) [![Coverage Status](https://coveralls.io/repos/github/abskmj/gridfile/badge.svg?branch=master)](https://coveralls.io/github/abskmj/gridfile?branch=master) [![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&color=red&logo=GitHub)](https://github.com/abskmj/gridfile)

# GridFile - Mongoose Schema for MongoDB GridFS
GridFile is a reusable [Mongoose](https://mongoosejs.com/) schema for [MongoDB GridFS](https://docs.mongodb.com/manual/core/gridfs/). No separate database setup is needed as it uses the Mongoose connection for interacting with GridFS.

# Installation
```bash
npm install gridfile
```

# Usage
- Import the schema
```javascript
const schema = require('gridfile')
```

- Create a Mongoose model from the schema
```javascript
const GridFile = mongoose.model('GridFile', schema)
```

- Upload a file
```javascript
const fileStream = fs.createReadStream('/path/to/file.ext')

const gridFile = new GridFile()
gridFile.filename = 'file.ext'
await gridFile.upload(fileStream)
```
- Download a file
```javascript
const fileStream = fs.createWriteStream('/path/to/file.ext')
const gridFile = GridFile.findById('id')

await gridFile.download(fileStream)
```

## Examples
- [Upload files to MongoDB GridFS with Express](https://abskmj.github.io/notes/posts/express/express-multer-mongoose-gridfile/) - Create express based APIs to upload and download files to and from MongoDB GridFS
- [Mongoose Query Population with GridFile Schema](https://gist.github.com/abskmj/2dafbf3296ef5dc0c7a2054110c75e53) - Store email attachments on GridFS and link them to an email to support Mongoose query population

# Documentation
Documentation is available at [API.md](API.md)

# Fixes & Improvements
Head over to the issues tab at [github.com](https://github.com/abskmj/gridfile/issues) to report a bug or suggest an improvement. Feel free to contribute to the code or documentation by creating a pull request.

# Sponsor / Support
If you find the project interesting or helpful, please consider sponsoring or supporting it at [github.com](https://github.com/abskmj/gridfile).
