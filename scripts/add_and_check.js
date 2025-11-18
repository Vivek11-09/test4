// Small helper to POST a new item and then fetch items to confirm
(async () => {
  try {
    const base = 'http://localhost:3001';
    const newItem = { name: 'Scripted Item ' + Date.now(), price: 42.5 };

    console.log('Posting new item to', base + '/api/items');
    const postRes = await fetch(base + '/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const created = await postRes.json();
    console.log('Created:', created);

    // Wait a short moment for file write to complete
    await new Promise(r => setTimeout(r, 250));

    // Query the API to find the item by q param
    const q = encodeURIComponent(newItem.name.split(' ')[0]);
    const listRes = await fetch(base + '/api/items?q=' + q + '&limit=20');
    const list = await listRes.json();
    console.log('Fetched items (first page):', list.meta || { total: list.length });

    const found = (list.items || list).find(i => i.id === created.id || i.name === created.name);
    console.log('Found in list?', Boolean(found));
    if (found) console.log(found);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 2;
  }
})();
