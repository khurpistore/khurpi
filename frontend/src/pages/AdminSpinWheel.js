import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, RefreshCw, Gift, AlertCircle } from 'lucide-react';

const AdminSpinWheel = () => {
  const [prizes, setPrizes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const defaultColors = [
    '#E53935', '#43A047', '#FF9800', '#8E24AA', '#795548', '#00ACC1', '#D81B60', '#5E35B1'
  ];

  useEffect(() => {
    fetchPrizes();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/spin-wheel/prizes`);
      setPrizes(response.data || []);
    } catch (err) {
      setError('Failed to load prizes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPrize = () => {
    const newPrize = {
      name: '',
      product_id: '',
      quantity: 0,
      unit: 'g',
      color: defaultColors[prizes.length % defaultColors.length],
      is_empty: false,
      products: []
    };
    setPrizes([...prizes, newPrize]);
  };

  const addComboProduct = (index, productId) => {
    if (!productId) return;
    const p = products.find((x) => (x.id || x._id) === productId);
    if (!p) return;
    const updated = [...prizes];
    const list = updated[index].products || [];
    if (list.some((it) => it.product_id === productId)) return;
    updated[index] = {
      ...updated[index],
      products: [...list, { product_id: productId, name: p.name, quantity: p.unit_value || 1, unit: p.unit || 'kg', image_url: p.image_url || p.image, price: p.price }]
    };
    setPrizes(updated);
  };

  const removeComboProduct = (index, productId) => {
    const updated = [...prizes];
    updated[index] = {
      ...updated[index],
      products: (updated[index].products || []).filter((it) => it.product_id !== productId)
    };
    setPrizes(updated);
  };

  const updatePrize = (index, field, value) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const removePrize = (index) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const savePrizes = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validate
      for (const prize of prizes) {
        if (!prize.name.trim()) {
          setError('All prizes must have a name');
          setSaving(false);
          return;
        }
      }

      await axios.post(`${BACKEND_URL}/api/admin/spin-wheel/prizes`, prizes);

      setSuccess('Prizes saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save prizes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <>
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Gift className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Spin Wheel Prizes</h1>
            <p className="text-sm text-gray-500">Configure prizes for the spin wheel game</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addPrize}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Prize
          </button>
          <button
            onClick={savePrizes}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
            <div className="col-span-1">Color</div>
            <div className="col-span-3">Prize Name</div>
            <div className="col-span-2">Linked Product</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Action</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {prizes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No prizes configured yet.</p>
              <button
                onClick={addPrize}
                className="mt-3 text-green-600 hover:underline"
              >
                Add your first prize
              </button>
            </div>
          ) : (
            prizes.map((prize, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Color picker */}
                  <div className="col-span-1">
                    <input
                      type="color"
                      value={prize.color}
                      onChange={(e) => updatePrize(index, 'color', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                  </div>

                  {/* Prize name */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={prize.name}
                      onChange={(e) => updatePrize(index, 'name', e.target.value)}
                      placeholder="Prize name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>

                  {/* Linked Product (from product list) */}
                  <div className="col-span-2">
                    <select
                      value={prize.product_id || ''}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const p = products.find((x) => (x.id || x._id) === pid);
                        updatePrize(index, 'product_id', pid);
                        if (p && !prize.name) updatePrize(index, 'name', p.name);
                      }}
                      disabled={prize.is_empty}
                      data-testid={`spin-prize-product-${index}`}
                      className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Link product…</option>
                      {products.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={prize.quantity}
                      onChange={(e) => updatePrize(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      disabled={prize.is_empty}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Unit */}
                  <div className="col-span-1">
                    <select
                      value={prize.unit}
                      onChange={(e) => updatePrize(index, 'unit', e.target.value)}
                      disabled={prize.is_empty}
                      className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:bg-gray-100"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                      <option value="%">%</option>
                    </select>
                  </div>

                  {/* Type (empty/prize) */}
                  <div className="col-span-2">
                    <select
                      value={prize.is_empty ? 'empty' : 'prize'}
                      onChange={(e) => updatePrize(index, 'is_empty', e.target.value === 'empty')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    >
                      <option value="prize">Prize</option>
                      <option value="empty">Better Luck</option>
                    </select>
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => removePrize(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Combo products (multiple products awarded together) */}
                {!prize.is_empty && (
                  <div className="mt-3 pl-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600">Combo products (optional — award multiple items together)</span>
                    </div>
                    <select
                      value=""
                      onChange={(e) => { addComboProduct(index, e.target.value); e.target.value = ''; }}
                      data-testid={`spin-combo-add-${index}`}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    >
                      <option value="">+ Add product to combo…</option>
                      {products.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                      ))}
                    </select>
                    {(prize.products || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(prize.products || []).map((it) => (
                          <span key={it.product_id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1">
                            {it.name} ({it.quantity}{it.unit})
                            <Trash2 className="w-3 h-3 cursor-pointer" onClick={() => removeComboProduct(index, it.product_id)} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Add at least 4-8 prizes for a good wheel experience</li>
          <li>• Include 1-2 "Better Luck" segments to balance win rate</li>
          <li>• Use distinct colors for better visual appeal</li>
          <li>• Link a product from your product list; leave empty for generic prizes</li>
          <li>• Use "Combo products" to award multiple items together (like a combo box)</li>
        </ul>
      </div>
    </div>
    </>
  );
};

export default AdminSpinWheel;
