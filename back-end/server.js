const express = require('express')
const cors = require('cors')
const multer = require('multer')
const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const app = express()
app.use(cors())

const upload = multer({ storage: multer.memoryStorage() })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file
    const fileName = `${Date.now()}_${file.originalname}`

    // Upload audio to Supabase
    const { error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      })

    if (uploadError) return res.status(500).json({ error: uploadError.message })

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('audio')
      .getPublicUrl(fileName)



//Deepgram transcription
      const deepgramRes = await axios.post('https://api.deepgram.com/v1/listen', file.buffer, {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': file.mimetype,
      },
    })

    const transcript = deepgramRes.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

//Supabase insertion
    await supabase.from('transcriptions').insert([
      {
        user_id: null,
        text: transcript,
        audio_url: publicUrl,
      },
    ])

    res.json({ transcript, audio_url: publicUrl })

  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
