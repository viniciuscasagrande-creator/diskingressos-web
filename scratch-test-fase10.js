async function testFase10() {
  const loginRes = await fetch('http://localhost:3333/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'vinicius@diskingressos.com.br',
      password: 'Produtor@123'
    })
  });
  const { token, user } = await loginRes.json();
  console.log(`🔑 Logged in as: ${user.name} (Producer ID #${user.producerId})`);

  const headers = { 'Authorization': `Bearer ${token}` };

  // 1. Núcleo Operacional Summary
  const summaryRes = await fetch('http://localhost:3333/api/operations/summary', { headers });
  const summary = await summaryRes.json();
  console.log('📊 Núcleo Operacional Summary:', summary);

  // 2. Lotes
  const lotsRes = await fetch('http://localhost:3333/api/lots', { headers });
  const lots = await lotsRes.json();
  console.log(`🎟️ Lotes cadastrados: ${lots.length}`, lots.map(l => `${l.name} (${l.event.title})`));

  // 3. Vendas / Pedidos
  const ordersRes = await fetch('http://localhost:3333/api/orders', { headers });
  const orders = await ordersRes.json();
  console.log(`🛒 Vendas / Pedidos: ${orders.length}`, orders.map(o => `${o.code} - R$ ${o.grossCents/100}`));

  // 4. Saldo Financeiro
  const balanceRes = await fetch('http://localhost:3333/api/finance/balance', { headers });
  const balance = await balanceRes.json();
  console.log('💰 Saldo Financeiro Liquidado:', `R$ ${balance.balanceCents / 100}`);
}

testFase10().catch(console.error);
