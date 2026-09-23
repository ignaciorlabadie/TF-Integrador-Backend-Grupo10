import express from 'express'

const app = express()

app.use(express.json())

app.get('/', (_req, res) => {
    res.json({
        mensaje: 'API Trabajo Final Integrador',
    })
})

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})
