/* eslint-env mocha */

const fs = require('fs')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { expect } = require('chai')
const MemoryStream = require('memorystream')

const { mongo } = mongoose

describe('Schema', () => {
  let GridFile
  let GridFileSchema
  let connection
  let mongodb

  before(async () => {
    // create mongo connection
    mongodb = await MongoMemoryServer.create()
    const connectionUri = await mongodb.getUri()

    connection = await mongoose.connect(
      connectionUri, { useNewUrlParser: true, useUnifiedTopology: true }
    )

    GridFileSchema = require('./src/gridFile.schema')

    GridFile = connection.model('GridFile', GridFileSchema)
  })

  after(async () => {
    // close mongo connection
    await mongoose.connection.close()
    await mongodb.stop()
  })

  describe('GridFS Bucket', () => {
    it('should create a GridFS Bucket', () => {
      const bucket = GridFile.getBucket()

      expect(bucket).instanceOf(mongo.GridFSBucket)
    })

    it('should create a GridFS Bucket with custom name', () => {
      const CustomGridFile = connection.model('CustomGridFile', GridFileSchema, 'attachment.files')

      const bucket = CustomGridFile.getBucket()

      expect(bucket).instanceOf(mongo.GridFSBucket)
      expect(bucket.s.options.bucketName).equals('attachment')
    })

    it('should throw error when collection name doesn\'t end with .files', () => {
      try {
        const CustomGridFile = connection.model('CustomGridFile1', GridFileSchema, 'attachment.files1')
        const bucket = CustomGridFile.getBucket()

        expect(bucket).equals(false)
      } catch (error) {
        expect(error.message).equals('Collection Name doesn\'t end with .files')
      }
    })
  })

  describe('GridFS Files', () => {
    it('should upload a file to GridFS', async () => {
      const file = new GridFile()

      file.filename = 'package.json'
      file.metadata = 'test'
      file.aliases = ['test-alieas1', 'alias-2']
      file.contentType = 'application/json'

      const fileStream = fs.createReadStream('./package.json')
      const uploadedFile = await file.upload(fileStream)

      expect(uploadedFile).instanceOf(GridFile)
    })

    it('should find recently uploaded file by id', async () => {
      const file = new GridFile()

      file.filename = 'package.json'

      const fileStream = fs.createReadStream('./package.json')
      const uploadedFile = await file.upload(fileStream)

      const foundFile = await GridFile.findById(uploadedFile.id)

      expect(foundFile.md5).equals(uploadedFile.md5)
    })

    it('should download a file from GridFS', async () => {
      const file = new GridFile()

      file.filename = 'package.json'

      const fileStream = fs.createReadStream('./package.json')
      const uploadedFile = await file.upload(fileStream)

      const foundFile = await GridFile.findById(uploadedFile.id)

      // download file as in-memory stream
      const stream = new MemoryStream()

      await foundFile.download(stream)

      expect(stream._readableState.length).equals(uploadedFile.length)
    })

    it('should delete a file from GridFS', async ()=>{
      const file = new GridFile()

      file.filename = 'package.json'

      const fileStream = fs.createReadStream('./package.json')
      const uploadedFile = await file.upload(fileStream)

      const foundFile = await GridFile.findByIdAndDelete(uploadedFile.id)
      expect(foundFile.md5).equals(uploadedFile.md5)

      const search = await GridFile.findOne()
      expect(search).to.equal(null)
    })

    afterEach(async () => {
      await GridFile.deleteMany()
    })
  })
})
