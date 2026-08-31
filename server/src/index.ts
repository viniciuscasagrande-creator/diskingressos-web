import app from './app.js'

const port = Number(process.env.PORT || process.env.API_PORT || 3333)

app.listen(port, '0.0.0.0', () => {
  console.log(`DiskIngressos API Fase 21.1.12: http://0.0.0.0:${port}/api`)
})
