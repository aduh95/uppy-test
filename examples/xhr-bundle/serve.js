const app = require('express')()
const cors = require('cors')
const multer = require('multer')

const upload = multer({
  storage: multer.memoryStorage(),
})

app.use(cors())
app.post('/upload', upload.array('files'), uploadRoute)

app.listen(9967)

function uploadRoute (req, res) {
  res.json({
    files: req.files.map((file) => {
      delete file.buffer
      return file
    }),
  })
}
