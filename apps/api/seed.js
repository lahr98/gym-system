fetch('http://localhost:3000/api/auth/sign-up/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5173'
  },
  body: JSON.stringify({
    name: 'Dueño',
    email: 'admin@gymsystem.com',
    password: 'Admin123!'
  })
})
    .then(async r => {
      console.log('Status:', r.status)
      console.log('Headers:', Object.fromEntries(r.headers.entries()))
      const text = await r.text()
      console.log('Body:', text)
      process.exit(0)
    })
    .catch(err => {
      console.error('Error:', err)
      process.exit(1)
    })