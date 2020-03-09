const assert = require('assert')
const Client = require('../source')

const client = new Client()
const objects = client.readObjects('./tests/samples/simple', {
  target: 'docs',
  exclude: ['.DS_Store', '.git']
})

assert.strictEqual(objects[0].filepath, 'docs/asd/sample1.txt')
assert.strictEqual(objects[1].filepath, 'docs/def/sample2.txt')

const client2 = new Client()
client2.defaultUploadOpts.hash = true
client2.defaultUploadOpts.target = 'assets'
const objects2 = client2.readObjects('./tests/samples/simple', client2.defaultUploadOpts)
assert.strictEqual(objects2[0].filepath, 'assets/asd/sample1.48517406ac7e.txt')
assert.strictEqual(objects2[1].filepath, 'assets/def/sample2.fb274508943a.txt')
