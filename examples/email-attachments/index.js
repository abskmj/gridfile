const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const fs = require('fs')
const path = require('path')

const Email = require('./email.model')
const Attachment = require('./attachment.model')

const start = async () => {
  // connect to a mongo database
  const mongodb = new MongoMemoryServer()
  const connectionUri = await mongodb.getUri()
  await mongoose.connect(
    connectionUri, { useNewUrlParser: true, useUnifiedTopology: true }
  )

  // upload an attachment from a local file
  const fileStream = fs.createReadStream(path.join(__dirname, 'attachment.pdf'))
  const attachment = new Attachment()
  attachment.filename = 'attachment.pdf'
  const uploadedAttachment = await attachment.upload(fileStream)

  console.log(uploadedAttachment)
  /*
    {
      aliases: [],
      _id: 5f3e8f06a37b5c4b1934a070,
      length: 7945,
      chunkSize: 261120,
      uploadDate: 2020-08-20T14:56:06.925Z,
      filename: 'attachment.pdf',
      md5: 'fa7d7e650b2cec68f302b31ba28235d8'
    }
  */

  // create a new email and link the uploaded attachment
  const email = new Email()
  email.to = 'abskmj@gmail.com'
  email.subject = 'Test Mail'
  email.html = 'Testing ...'
  email.attachments.push(uploadedAttachment)
  const savedEmail = await email.save()

  // find an email and linked attachments
  const foundEmail = await Email.findById(savedEmail).populate('attachments')
  const foundAttachment = foundEmail.attachments[0]

  // download file and save it locally
  const downloadStream = fs.createWriteStream(path.join(__dirname, 'download.pdf'))
  await foundAttachment.download(downloadStream)

  // close mongo connection
  await mongoose.connection.close()
  await mongodb.stop()
}

start()
