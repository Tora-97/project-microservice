const http = require('http');

const API_BASE = 'http://localhost:8080/api/v1';

async function request(endpoint, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(`${API_BASE}${endpoint}`, options, (res) => {
      let resData = '';
      res.on('data', (chunk) => { resData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(resData));
        } catch (e) {
          resolve(resData);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

const productsToSeed = [];

async function seed() {
  const categories = [
    { name: "Tops", description: "Shirts and jackets" },
    { name: "Bottoms", description: "Pants and shorts" },
    { name: "Accessories", description: "Hats and more" }
  ];

  console.log("Seeding categories...");
  const createdCategories = [];
  for (const cat of categories) {
    try {
      const res = await request('/categories', 'POST', cat);
      if (res && res.data) {
        console.log(`✅ Created Category: ${res.data.name} (ID: ${res.data.id})`);
        createdCategories.push(res.data);
      }
    } catch (e) {
      console.error(`❌ Failed to create Category: ${cat.name}`);
    }
  }

  // Update products with actual category IDs
  if (createdCategories.length >= 3 && productsToSeed.length > 0) {
    if (productsToSeed[0]) productsToSeed[0].categoryId = createdCategories[0].id; // Tops
    if (productsToSeed[1]) productsToSeed[1].categoryId = createdCategories[0].id; // Tops
    if (productsToSeed[2]) productsToSeed[2].categoryId = createdCategories[1].id; // Bottoms
    if (productsToSeed[3]) productsToSeed[3].categoryId = createdCategories[0].id; // Tops
    if (productsToSeed[4]) productsToSeed[4].categoryId = createdCategories[2].id; // Accessories
    
    // Remove the nested category object to avoid payload issues
    productsToSeed.forEach(p => delete p.category);
  }

  console.log("\nSeeding products...");
  const createdProducts = [];
  
  for (const p of productsToSeed) {
    try {
      const res = await request('/products', 'POST', p);
      if (res && res.data) {
        console.log(`✅ Created Product: ${res.data.name} (ID: ${res.data.id})`);
        createdProducts.push(res.data);
      }
    } catch (e) {
      console.error(`❌ Failed to create product ${p.name}:`, e.message);
    }
  }

  console.log("\nFetching products from DB to ensure IDs are populated...");
  const fetchRes = await request('/products', 'GET');
  const allProducts = fetchRes.data || [];
  
  console.log("\nSeeding orders...");
  
  if (allProducts.length >= 2) {
    const orderPayload1 = {
      userId: 1, // Assuming user 1 exists
      items: [
        { productId: allProducts[0].id, productVariantId: allProducts[0].variants[0].id, quantity: 2 },
        { productId: allProducts[1].id, productVariantId: allProducts[1].variants[0].id, quantity: 1 }
      ]
    };
    
    const orderPayload2 = {
      userId: 1,
      items: [
        { productId: allProducts[2].id, productVariantId: allProducts[2].variants[0].id, quantity: 3 }
      ]
    };

    try {
      const res1 = await request('/orders', 'POST', orderPayload1);
      console.log(`✅ Created Order 1: ${res1.data.id}`);
      
      const res2 = await request('/orders', 'POST', orderPayload2);
      console.log(`✅ Created Order 2: ${res2.data.id}`);
    } catch (e) {
      console.error(`❌ Failed to create orders:`, e.message);
    }
  } else {
    console.log("Not enough products created to seed orders.");
  }
  
  console.log("\nDone!");
}

seed();
