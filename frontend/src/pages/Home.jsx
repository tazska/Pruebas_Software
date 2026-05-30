import { useState, useEffect } from 'react';
import { products } from '../api';
import { ShoppingCart } from 'lucide-react';

export default function Home() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await products.getAll();
      setProductList(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Cargando catálogo...</div>;

  return (
    <div className="container">
      <div className="products-grid">
        {productList.map(product => (
          <div className="card" key={product.id}>
            <img 
              src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'} 
              alt={product.name} 
              className="product-img"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'; }}
            />
            <div className="product-content">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-desc">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <span className="product-stock">Stock: {product.stock}</span>
              </div>
              <button className="btn" style={{ width: '100%', marginTop: '1.5rem' }}>
                <ShoppingCart size={18} /> Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
      {productList.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          No hay productos disponibles por el momento.
        </div>
      )}
    </div>
  );
}
