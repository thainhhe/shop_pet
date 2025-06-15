import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function ShopDashboard() {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const fetchData = async () => {
        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const [statsRes, productsRes, petsRes] = await Promise.all([
                api.get('/shop/stats', config),
                api.get('/shop/products', config),
                api.get('/shop/pets', config)
            ]);

            setStats(statsRes.data);
            setProducts(productsRes.data);
            setPets(petsRes.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while fetching dashboard data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${productId}`);
                // Refresh the data after deleting
                fetchData();
            } catch (err) {
                alert('Failed to delete product.');
                console.error(err);
            }
        }
    };

    const handleDeletePet = async (petId) => {
        if (window.confirm('Are you sure you want to delete this pet?')) {
            try {
                await api.delete(`/pets/${petId}`);
                // Refresh the data after deleting
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete pet.');
                console.error(err);
            }
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-800">Shop Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Total Orders Sold</h3>
                    <p className="text-3xl font-semibold text-gray-800">{stats?.totalSales ?? '...'}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Items in Stock</h3>
                    <p className="text-3xl font-semibold text-gray-800">{stats?.totalInventory ?? '...'}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Products Listed</h3>
                    <p className="text-3xl font-semibold text-gray-800">{stats?.productCount ?? '...'}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Pets Listed</h3>
                    <p className="text-3xl font-semibold text-gray-800">{stats?.petCount ?? '...'}</p>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Your Products</h2>
                    <Link to="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Product</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* table head */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.inventory.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/products/${product._id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            disabled={!product.isActive}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pets Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Your Pets</h2>
                    <Link to="/pets/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Pet</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pets.map(pet => (
                                <tr key={pet._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{pet.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{pet.breed}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${pet.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pet.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {pet.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/pets/${pet._id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button
                                            onClick={() => handleDeletePet(pet._id)}
                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            disabled={pet.status !== 'available'}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ShopDashboard;