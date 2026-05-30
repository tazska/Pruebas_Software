import { useState, useEffect } from 'react';
import { products } from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminDashboard() {
  const [productList, setProductList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    products.getAll().then(setProductList).catch(console.error);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await products.getAll();
      setProductList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        image_url: product.image_url || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', price: '', stock: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      if (editingId) {
        await products.update(editingId, data);
      } else {
        await products.create(data);
      }
      closeModal();
      loadProducts();
    } catch (err) {
      alert('Error guardando producto' + err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Seguro que deseas eliminar este producto?')) {
      try {
        await products.delete(id);
        loadProducts();
      } catch {
        alert('Error eliminando producto');
      }
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Productos</h1>
        <button className="btn" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productList.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <img 
                    src={p.image_url || 'https://via.placeholder.com/40'} 
                    alt={p.name} 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                  />
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>
                  <span className="product-stock" style={{ background: p.stock < 5 ? '#fef2f2' : '#f1f5f9', color: p.stock < 5 ? 'var(--danger)' : 'var(--text-muted)'}}>
                    {p.stock} undis.
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '4px' }} onClick={() => handleOpenModal(p)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', borderRadius: '4px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productList.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={closeModal} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto</label>
                <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">URL de Imagen</label>
                <input type="url" className="form-control" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Precio ($)</label>
                  <input required type="number" step="0.01" className="form-control" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stock</label>
                  <input required type="number" className="form-control" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn">{editingId ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
