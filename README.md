# intercdn
Wrapper across SDKs of CDN services.

## Install
Through npm:
```sh
npm i intercdn
```

## Single API For Cloud CDN Services
Initiate the CDN service you would like to use:
```js
const Client = require('intercdn')
const client = new Client()
// initiating amazon s3
// set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
client.init('s3', function() {
  // amazon s3 instance ready to use
})
```
Upload a file (or folder):
```js
const Client = require('intercdn')
const client = new Client()
client.init('s3', function() {
  // amazon s3 instance ready to use
  // request options
  const opts = {
    // bucket is required in s3
    bucket: 'mycdn',
    // target is the path inside the bucket which your objects will be placed
    target: 'test',
    // if set true, a hash will be added to filenames.
    hash: false,
    // service spesific options
    s3: {
      ACL: 'public-read'
    }
  }
  // uploading the contents of the simple folder to the target which is test
  client.upload('./tests/samples/simple', opts, function(err, list) {
    /*
    * err is javascript native error object in the case of an error
    * list is a list of uploaded files
    */
    const exampleList = [{
      // raw property is what service returned originally
      raw: { ETag: '"fb274508943af633a0a035abf161ecbe"' },
      // uploaded can be accessible through this path
      filepath: 'test/def/sample2.txt',
      // amazon s3 isn't give you an id unless you enable versioning
      id: null,
      // md5 hash of the file
      hash: 'fb274508943af633a0a035abf161ecbe'
    }]
  })
})
```
Set `hash` option to `true` if you want to add hash string into your filenames. Filenames with hash considered as **immutable** which **Cache-Control** header set to **public,max-age=31536000,immutable**.
```js
const opts = {
  bucket: 'mycdn',
  target: 'test',
  hash: true,
  s3: {
    ACL: 'public-read'
  }
}
client.upload('./tests/samples/simple', opts, function(err, list) {
  // each filepath in the list will be something like:
  // test/def/sample2.08a2179b7e51.txt
})
```

## Supported Services
1. Amazon S3

## Adding Services
InterCDN is flexible enough to integrate more services. You can see the s3 service file inside the `source/services/` folder.
A minimal example service:
```js
function InterCDNClientMyService() {
  this.intercdn = null
  this.client = null
  this.initiated = false
}

InterCDNClientMyService.prototype.init = function init(client, callback) {
  if (this.initiated) return callback()

  this.intercdn = client
  this.client = null // get client
  this.initiated = true
  return callback()
}

InterCDNClientMyService.prototype.upload = function upload(filepath, opts, callback) {
  // upload file or folder in filepath
}

InterCDNClientMyService.prototype.getClient = function getClient() {
  return this.client
}

module.exports = new InterCDNClientMyService
```
Then, register service:
```js
const Client = require('intercdn')
const myService = require('./myService')
const client = new Client()
client.addService('myservice', myService)
client.init('myservice', function() {
  // service is ready to use.
})
```
