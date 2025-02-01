<a name="GridFile"></a>

## GridFile
**Kind**: global class  

* [GridFile](#GridFile)
    * [new GridFile()](#new_GridFile_new)
    * _instance_
        * [.length](#GridFile+length) : <code>Number</code>
        * [.chunkSize](#GridFile+chunkSize) : <code>Number</code>
        * [.uploadDate](#GridFile+uploadDate) : <code>Date</code>
        * [.md5](#GridFile+md5) : <code>String</code>
        * [.filename](#GridFile+filename) : <code>String</code>
        * [.contentType](#GridFile+contentType) : <code>String</code>
        * [.metadata](#GridFile+metadata) : <code>Any</code>
        * [.aliases](#GridFile+aliases) : <code>Array.&lt;String&gt;</code>
        * [.createdAt](#GridFile+createdAt) : <code>Date</code>
        * [.chunkSizeBytes](#GridFile+chunkSizeBytes) : <code>Number</code>
        * [.getUploadStream](#GridFile+getUploadStream) ⇒ <code>GridFSBucketWriteStream</code>
        * [.getDownloadStream](#GridFile+getDownloadStream) ⇒ <code>GridFSBucketReadStream</code>
        * [.uploadStream](#GridFile+uploadStream) ⇒ <code>GridFSBucketWriteStream</code>
        * [.downloadStream](#GridFile+downloadStream) ⇒ <code>GridFSBucketWriteStream</code>
        * [.upload](#GridFile+upload) ⇒ [<code>Promise.&lt;GridFile&gt;</code>](#GridFile)
        * [.download](#GridFile+download) ⇒ <code>Promise.&lt;Void&gt;</code>
    * _static_
        * [.getBucket](#GridFile.getBucket) ⇒ <code>GridFSBucket</code>
        * [.findOneAndDelete](#GridFile.findOneAndDelete) ⇒ [<code>Promise.&lt;GridFile&gt;</code>](#GridFile)
        * [.findByIdAndDelete](#GridFile.findByIdAndDelete) ⇒ [<code>Promise.&lt;GridFile&gt;</code>](#GridFile)

<a name="new_GridFile_new"></a>

### new GridFile()
Mongoose schema for MongoDB GridFS

```javascript
const mongoose = require('mongoose')
const schema = require('gridfile')

const GridFile = mongoose.model('GridFile', schema)

const gridFile = new GridFile()
```

<a name="GridFile+length"></a>

### gridFile.length : <code>Number</code>
**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+chunkSize"></a>

### gridFile.chunkSize : <code>Number</code>
**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+uploadDate"></a>

### gridFile.uploadDate : <code>Date</code>
**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+md5"></a>

### gridFile.md5 : <code>String</code>
**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+filename"></a>

### gridFile.filename : <code>String</code>
A MD5 hash is auto-generated when a file is uploaded

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+contentType"></a>

### gridFile.contentType : <code>String</code>
Value is be used as `contentType` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+metadata"></a>

### gridFile.metadata : <code>Any</code>
Value is be used as `metadata` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+aliases"></a>

### gridFile.aliases : <code>Array.&lt;String&gt;</code>
Value is be used as `aliases` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+createdAt"></a>

### gridFile.createdAt : <code>Date</code>
Alias for GridFile#uploadDate

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+chunkSizeBytes"></a>

### gridFile.chunkSizeBytes : <code>Number</code>
Value is be used as `chunkSizeBytes` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
<a name="GridFile+getUploadStream"></a>

### gridFile.getUploadStream ⇒ <code>GridFSBucketWriteStream</code>
Get a GridFS stream to upload a file

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
**Returns**: <code>GridFSBucketWriteStream</code> - Upload Stream  
**Example**  
```js
const uploadStream = gridFile.getUploadStream()
```
<a name="GridFile+getDownloadStream"></a>

### gridFile.getDownloadStream ⇒ <code>GridFSBucketReadStream</code>
Get a GridFS stream to download a file

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
**Returns**: <code>GridFSBucketReadStream</code> - Download Stream  
**Example**  
```js
const downloadStream = gridFile.getDownloadStream()
```
<a name="GridFile+uploadStream"></a>

### gridFile.uploadStream ⇒ <code>GridFSBucketWriteStream</code>
Upload a file to GridFS

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
**Returns**: <code>GridFSBucketWriteStream</code> - Upload Stream  

| Param | Type | Description |
| --- | --- | --- |
| FileStream | <code>Stream</code> | Read stream of file to upload |

**Example**  
```js
const fs = require('fs')

const fileStream = fs.createReadStream('/path/to/file')
const uploadStream = gridFile.uploadStream(fileStream)

uploadStream.on('finish', (file) => {
 console.log(file)
})
```
<a name="GridFile+downloadStream"></a>

### gridFile.downloadStream ⇒ <code>GridFSBucketWriteStream</code>
Download a file from GridFS

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
**Returns**: <code>GridFSBucketWriteStream</code> - Download Stream  

| Param | Type | Description |
| --- | --- | --- |
| FileStream | <code>Stream</code> | Write stream of file to download into |

**Example**  
```js
const fs = require('fs')

const fileStream = fs.createWriteStream('/path/to/file')
const DownloadStream = gridFile.downloadStream(fileStream)

fileStream.on('finish', () => {
 console.log('File downloaded successfully')
})
```
<a name="GridFile+upload"></a>

### gridFile.upload ⇒ [<code>Promise.&lt;GridFile&gt;</code>](#GridFile)
Upload a file to GridFS

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
**Returns**: [<code>Promise.&lt;GridFile&gt;</code>](#GridFile) - GridFile as a Promise  

| Param | Type | Description |
| --- | --- | --- |
| FileStream | <code>Stream</code> | Read stream of file to upload |
| Callback | <code>function</code> | Callback function |

**Example**  
```js
const fs = require('fs')

const fileStream = fs.createReadStream('/path/to/file')
const uploadedFile = await gridFile.upload(fileStream)
```
**Example**  
```js
// callback
gridFile.upload(filestream, (err, uploadedFile) => {
 if(err){
   console.error(err)
 } else {
   console.log(uploadedFile)
 }
})
```
<a name="GridFile+download"></a>

### gridFile.download ⇒ <code>Promise.&lt;Void&gt;</code>
Download a file from GridFS

**Kind**: instance property of [<code>GridFile</code>](#GridFile)  
**Returns**: <code>Promise.&lt;Void&gt;</code> - Promise  

| Param | Type | Description |
| --- | --- | --- |
| FileStream | <code>Stream</code> | Write stream of file to download into |
| Callback | <code>function</code> | Callback function |

**Example**  
```js
const fs = require('fs')

const fileStream = fs.createWriteStream('/path/to/file')
await gridFile.download(fileStream)
```
**Example**  
```js
// callback
gridFile.download(fileStream, (err){
 if(err){
   console.error(err)
 } else {
   console.log('File downloaded successfully')
 }
})
```
<a name="GridFile.getBucket"></a>

### GridFile.getBucket ⇒ <code>GridFSBucket</code>
Get the GridFS bucket created from the Mongoose connection

**Kind**: static property of [<code>GridFile</code>](#GridFile)  
**Returns**: <code>GridFSBucket</code> - GridFS Bucket  
**Example**  
```js
const bucket = GridFile.getBucket()
```
<a name="GridFile.findOneAndDelete"></a>

### GridFile.findOneAndDelete ⇒ [<code>Promise.&lt;GridFile&gt;</code>](#GridFile)
Delete a file from GridFS using [GridFSBucket#delete](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#delete)

**Kind**: static property of [<code>GridFile</code>](#GridFile)  
**Returns**: [<code>Promise.&lt;GridFile&gt;</code>](#GridFile) - Deleted GridFile as a Promise  
**Example**  
```js
const deletedFile = await GridFile.findOneAndDelete({ filename: 'image.png' })
```
<a name="GridFile.findByIdAndDelete"></a>

### GridFile.findByIdAndDelete ⇒ [<code>Promise.&lt;GridFile&gt;</code>](#GridFile)
Delete a file from GridFS using [GridFSBucket#delete](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#delete)

**Kind**: static property of [<code>GridFile</code>](#GridFile)  
**Returns**: [<code>Promise.&lt;GridFile&gt;</code>](#GridFile) - Deleted GridFile as a Promise  
**Example**  
```js
const deletedFile = await GridFile.findByIdAndDelete('some-id')
```
