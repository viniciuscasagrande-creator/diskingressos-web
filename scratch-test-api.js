async function run() {
  const loginRes = await fetch('http://localhost:3333/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@diskingressos.com.br',
      password: 'Admin@123'
    })
  });
  const loginData = await loginRes.json();
  console.log('👑 Admin Master Login:', loginData.user.name, `(producerId: ${loginData.user.producerId})`);

  // Test Events with Admin Master JWT (Global View)
  const eventsRes = await fetch('http://localhost:3333/api/events', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const eventsData = await eventsRes.json();
  console.log(`🌐 Global Events for Admin Master (${eventsData.length} total):`, eventsData.map(e => `${e.title} [Produtora: ${e.producer.name}]`));
}

run().catch(console.error);
