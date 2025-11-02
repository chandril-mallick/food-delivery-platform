import React, { useState, useEffect } from 'react';
import {
  createDocument,
  getDocument,
  getCollection,
  updateDocument,
  deleteDocument,
  queryDocuments} from '../firebase/firestore';

const FirestoreExample = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course'
  });
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all menu items on component mount
  useEffect(() => {
    fetchMenuItems();
    
    // Optional: Set up real-time listener
    // const unsubscribe = subscribeToCollection('menuItems', (items) => {
    //   setMenuItems(items);
    // });
    // return () => unsubscribe();
  }, []);

  // Fetch all menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const items = await getCollection('menuItems');
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new menu item
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    try {
      const docId = await createDocument('menuItems', {
        ...newItem,
        price: parseFloat(newItem.price),
        available: true
      });
      
      console.log('Created item with ID:', docId);
      setNewItem({ name: '', description: '', price: '', category: 'Main Course' });
      fetchMenuItems(); // Refresh the list
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  // Update an existing menu item
  const handleUpdateItem = async (itemId, updatedData) => {
    try {
      await updateDocument('menuItems', itemId, updatedData);
      console.log('Item updated successfully');
      setEditingItem(null);
      fetchMenuItems(); // Refresh the list
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Delete a menu item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDocument('menuItems', itemId);
        console.log('Item deleted successfully');
        fetchMenuItems(); // Refresh the list
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  // Query items by category
  const handleQueryByCategory = async (category) => {
    try {
      const items = await queryDocuments('menuItems', [
        { field: 'category', operator: '==', value: category }
      ]);
      setMenuItems(items);
    } catch (error) {
      console.error('Error querying items:', error);
    }
  };

  // Get a single item by ID
  const handleGetSingleItem = async (itemId) => {
    try {
      const item = await getDocument('menuItems', itemId);
      console.log('Single item:', item);
      alert(`Item: ${item?.name || 'Not found'}`);
    } catch (error) {
      console.error('Error getting single item:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firestore CRUD Example</h1>

      {/* Create New Item Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Menu Item</h2>
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
          </div>
          <textarea
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows="3"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="Main Course">Main Course</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Dessert">Dessert</option>
            <option value="Beverage">Beverage</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </form>
      </div>

      {/* Filter Buttons */}
      <div className="mb-4 space-x-2">
        <button
          onClick={fetchMenuItems}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          All Items
        </button>
        <button
          onClick={() => handleQueryByCategory('Main Course')}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Main Course
        </button>
        <button
          onClick={() => handleQueryByCategory('Dessert')}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Desserts
        </button>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Menu Items</h2>
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : menuItems.length === 0 ? (
          <p className="p-4 text-gray-500">No items found. Add some items or seed the database.</p>
        ) : (
          <div className="divide-y">
            {menuItems.map((item) => (
              <div key={item.id} className="p-4">
                {editingItem === item.id ? (
                  <EditItemForm
                    item={item}
                    onSave={(updatedData) => handleUpdateItem(item.id, updatedData)}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <p className="text-green-600 font-bold">₹{item.price}</p>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleGetSingleItem(item.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditingItem(item.id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Item Form Component
const EditItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || '',
    price: item.price.toString(),
    category: item.category || 'Main Course'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border rounded px-2 py-1"
          required
        />
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="border rounded px-2 py-1"
          required
        />
      </div>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full border rounded px-2 py-1"
        rows="2"
      />
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="border rounded px-2 py-1"
      >
        <option value="Main Course">Main Course</option>
        <option value="Appetizer">Appetizer</option>
        <option value="Dessert">Dessert</option>
        <option value="Beverage">Beverage</option>
      </select>
      <div className="space-x-2">
        <button
          type="submit"
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FirestoreExample;
