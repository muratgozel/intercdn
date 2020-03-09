const Client = require('../source')

const client = new Client('s3')
client.init('s3', function() {
  client.upload('./tests/samples/simple', {
    bucket: 'cdn.gozel.com.tr',
    s3: {
      ACL: 'public-read',
      ContentType: 'text/plain'
    }
  }, function(err, list) {
    console.log(err, list)
  })
})
