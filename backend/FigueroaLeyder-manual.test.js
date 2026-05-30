/**
 * PRUEBA UNITARIA MANUAL - SIN FRAMEWORK
 * Controlador: GET /api/products/:id
 * Archivo: test_manual.js
 * Ejecutar: node test_manual.js
 */

// ─────────────────────────────────────────────
// Simulación (Mock) de la base de datos
// ─────────────────────────────────────────────
const mockDB = {
  get: (query, params, callback) => {
    const fakeProducts = [
      { id: 1, name: 'Laptop', description: 'Laptop gamer', price: 1500, stock: 10, image_url: 'laptop.png' },
      { id: 2, name: 'Mouse',  description: 'Mouse inalámbrico', price: 25,   stock: 50, image_url: 'mouse.png'  },
    ];
    const product = fakeProducts.find(p => p.id === Number(params[0]));
    // Simula el comportamiento asíncrono de sqlite3
    callback(null, product || undefined);
  },
};

// ─────────────────────────────────────────────
// Simulación (Mock) de req y res de Express
// ─────────────────────────────────────────────
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data)   { this.body = data;       return this; },
  };
  return res;
}

// ─────────────────────────────────────────────
// Controlador aislado (extraído de server.js)
// ─────────────────────────────────────────────
function getProductById(db) {
  return (req, res) => {
    db.get(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      }
    );
  };
}

// ─────────────────────────────────────────────
// Utilidades de aserción y reporte
// ─────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

function describe(suiteName, fn) {
  console.log(`\n📦 ${suiteName}`);
  fn();
}

function it(testName, fn) {
  console.log(`\n  🧪 ${testName}`);
  fn();
}

// ─────────────────────────────────────────────
// SUITE DE PRUEBAS
// ─────────────────────────────────────────────
describe('GET /api/products/:id — Pruebas Manuales', () => {

  it('TC-01 | Debe retornar el producto correcto cuando el ID existe', () => {
    const req = { params: { id: '1' } };
    const res = createMockRes();
    getProductById(mockDB)(req, res);

    assert(res.body !== null,               'La respuesta no debe ser nula');
    assert(res.body.id === 1,               'El id del producto debe ser 1');
    assert(res.body.name === 'Laptop',      'El nombre debe ser "Laptop"');
    assert(res.body.price === 1500,         'El precio debe ser 1500');
    assert(res.statusCode === 200,          'El status HTTP debe ser 200');
  });

  it('TC-02 | Debe retornar undefined cuando el ID no existe', () => {
    const req = { params: { id: '999' } };
    const res = createMockRes();
    getProductById(mockDB)(req, res);

    assert(res.body === undefined,          'El body debe ser undefined para ID inexistente');
    assert(res.statusCode === 200,          'El status HTTP debe seguir siendo 200 (sqlite3 no lanza error)');
  });

  it('TC-03 | Debe retornar status 500 cuando la BD falla', () => {
    const errorDB = {
      get: (query, params, callback) => callback(new Error('DB connection lost'), null),
    };
    const req = { params: { id: '1' } };
    const res = createMockRes();
    getProductById(errorDB)(req, res);

    assert(res.statusCode === 500,          'El status HTTP debe ser 500');
    assert(res.body.error !== undefined,    'El body debe contener la propiedad "error"');
    assert(
      res.body.error === 'DB connection lost',
      'El mensaje de error debe coincidir con el de la BD'
    );
  });

  it('TC-04 | Debe retornar el segundo producto cuando se pide ID 2', () => {
    const req = { params: { id: '2' } };
    const res = createMockRes();
    getProductById(mockDB)(req, res);

    assert(res.body.id === 2,              'El id debe ser 2');
    assert(res.body.name === 'Mouse',      'El nombre debe ser "Mouse"');
    assert(res.body.stock === 50,          'El stock debe ser 50');
  });

});

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────
console.log('\n─────────────────────────────────────');
console.log(`📊 Resultados: ${passed} passed  |  ${failed} failed`);
console.log('─────────────────────────────────────\n');
if (failed > 0) process.exit(1);