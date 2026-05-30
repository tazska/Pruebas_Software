/**
 * PRUEBA UNITARIA CON MOCHA + CHAI
 * Controlador: GET /api/products/:id
 * Archivo: test_mocha.js
 *
 * Instalación:   npm install --save-dev mocha chai
 * Ejecutar:      npx mocha test_mocha.js
 */

const { expect } = require('chai');

// ─────────────────────────────────────────────
// Simulación (Mock) de la base de datos
// ─────────────────────────────────────────────
const fakeProducts = [
  { id: 1, name: 'Laptop', description: 'Laptop gamer',      price: 1500, stock: 10, image_url: 'laptop.png' },
  { id: 2, name: 'Mouse',  description: 'Mouse inalámbrico', price: 25,   stock: 50, image_url: 'mouse.png'  },
];

const mockDB = {
  get(query, params, callback) {
    const product = fakeProducts.find(p => p.id === Number(params[0]));
    callback(null, product || undefined);
  },
};

const errorDB = {
  get(query, params, callback) {
    callback(new Error('DB connection lost'), null);
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
// SUITE DE PRUEBAS — MOCHA + CHAI
// ─────────────────────────────────────────────
describe('GET /api/products/:id', () => {

  describe('TC-01 | Producto encontrado (ID válido)', () => {
    let res;

    before(() => {
      res = createMockRes();
      getProductById(mockDB)({ params: { id: '1' } }, res);
    });

    it('debe responder con status 200', () => {
      expect(res.statusCode).to.equal(200);
    });

    it('debe retornar un objeto no nulo', () => {
      expect(res.body).to.not.be.null;
      expect(res.body).to.be.an('object');
    });

    it('debe retornar el producto con id = 1', () => {
      expect(res.body.id).to.equal(1);
    });

    it('debe retornar el nombre correcto del producto', () => {
      expect(res.body.name).to.equal('Laptop');
    });

    it('debe retornar el precio correcto', () => {
      expect(res.body.price).to.equal(1500);
    });

    it('debe incluir todas las propiedades esperadas', () => {
      expect(res.body).to.have.all.keys('id', 'name', 'description', 'price', 'stock', 'image_url');
    });
  });

  describe('TC-02 | Producto no encontrado (ID inexistente)', () => {
    let res;

    before(() => {
      res = createMockRes();
      getProductById(mockDB)({ params: { id: '999' } }, res);
    });

    it('debe responder con status 200 (sqlite3 no lanza error)', () => {
      expect(res.statusCode).to.equal(200);
    });

    it('debe retornar undefined en el body', () => {
      expect(res.body).to.be.undefined;
    });
  });

  describe('TC-03 | Error en la base de datos', () => {
    let res;

    before(() => {
      res = createMockRes();
      getProductById(errorDB)({ params: { id: '1' } }, res);
    });

    it('debe responder con status 500', () => {
      expect(res.statusCode).to.equal(500);
    });

    it('debe retornar un objeto con la propiedad "error"', () => {
      expect(res.body).to.have.property('error');
    });

    it('el mensaje de error debe coincidir con el lanzado por la BD', () => {
      expect(res.body.error).to.equal('DB connection lost');
    });
  });

  describe('TC-04 | Segundo producto (ID = 2)', () => {
    let res;

    before(() => {
      res = createMockRes();
      getProductById(mockDB)({ params: { id: '2' } }, res);
    });

    it('debe retornar el producto con id = 2', () => {
      expect(res.body.id).to.equal(2);
    });

    it('debe retornar el nombre "Mouse"', () => {
      expect(res.body.name).to.equal('Mouse');
    });

    it('debe retornar stock = 50', () => {
      expect(res.body.stock).to.equal(50);
    });
  });

});