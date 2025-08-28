import React, { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";
import { useOrderStore } from "../store/orderStore";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  image: "",
  quantityAvailable: "",
};

export default function AdminPage() {
  const {
    products,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    loading: productsLoading,
  } = useProductStore();

  const {
    orders,
    fetchOrders,
    updateOrderStatus,
    loading: ordersLoading,
  } = useOrderStore();

  const [isEdit, setIsEdit] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Handle product form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  // Add or Edit product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateProduct(editId, { ...productForm, price: +productForm.price, quantityAvailable: +productForm.quantityAvailable });
    } else {
      addProduct({ ...productForm, price: +productForm.price, quantityAvailable: +productForm.quantityAvailable });
    }
    setProductForm(emptyProduct);
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (product) => {
    setProductForm(product);
    setIsEdit(true);
    setEditId(product.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      deleteProduct(id);
    }
  };

  // Render
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-himalaya-dark">Admin Dashboard</h1>

      {/* Product Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Product" : "Add New Product"}</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={productForm.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="border rounded p-2"
            required
          />
          <input
            name="image"
            value={productForm.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="border rounded p-2"
            required
          />
          <input
            name="price"
            value={productForm.price}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="Price (₹)"
            className="border rounded p-2"
            required
          />
          <input
            name="quantityAvailable"
            value={productForm.quantityAvailable}
            onChange={handleChange}
            type="number"
            min="0"
            placeholder="Available Qty"
            className="border rounded p-2"
            required
          />
          <textarea
            name="description"
            value={productForm.description}
            onChange={handleChange}
            placeholder="Description"
            className="border rounded p-2 col-span-1 md:col-span-2"
            required
          />
          <button
            type="submit"
            className="bg-himalaya text-white px-4 py-2 rounded hover:bg-himalaya-dark col-span-1 md:col-span-2"
          >
            {isEdit ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white p-6 rounded-lg shadow mb-12">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        {productsLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-himalaya-light">
                <th className="border px-2 py-1">Image</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">Edit</th>
                <th className="border px-2 py-1">Delete</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="border px-2 py-1">
                    <img src={p.image} alt={p.name} className="w-16 h-12 object-cover rounded" />
                  </td>
                  <td className="border px-2 py-1">{p.name}</td>
                  <td className="border px-2 py-1">₹{p.price}</td>
                  <td className="border px-2 py-1">{p.quantityAvailable}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:underline"
                      aria-label="Edit"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                      aria-label="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Orders</h2>
        {ordersLoading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-himalaya-light">
                <th className="border px-2 py-1">Order ID</th>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Update Status</th>
                <th className="border px-2 py-1">Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="border px-2 py-1">{o.id}</td>
                  <td className="border px-2 py-1">{o.userEmail || o.userId}</td>
                  <td className="border px-2 py-1">₹{o.total}</td>
                  <td className="border px-2 py-1">{o.status}</td>
                  <td className="border px-2 py-1">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateOrderStatus(o.id, e.target.value)
                      }
                      className="border rounded"
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <ul>
                      {o.items &&
                        o.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
