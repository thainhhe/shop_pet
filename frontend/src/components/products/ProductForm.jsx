import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ProductForm = ({ isEdit = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        category: 'food',
        subcategory: '',
        petTypes: [],
        price: '',
        originalPrice: '',
        discount: {
            percentage: '',
            validUntil: '',
        },
        inventory: {
            quantity: ''
        },
        specifications: {
            weight: '',
            dimensions: '',
            material: '',
            ageRange: '',
            ingredients: '',
        },
        isActive: true,
        tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const petTypeOptions = ["dog", "cat", "bird", "fish", "rabbit", "hamster", "all"];

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            api.get(`/products/${id}`)
                .then(res => {
                    const product = res.data.product;
                    setFormData({
                        name: product.name || '',
                        description: product.description || '',
                        brand: product.brand || '',
                        category: product.category || 'food',
                        subcategory: product.subcategory || '',
                        petTypes: product.petTypes || [],
                        price: product.price || '',
                        originalPrice: product.originalPrice || '',
                        discount: product.discount || { percentage: '', validUntil: '' },
                        inventory: product.inventory || { quantity: '' },
                        specifications: product.specifications || { weight: '', dimensions: '', material: '', ageRange: '', ingredients: '' },
                        isActive: product.isActive,
                        tags: product.tags || [],
                    });
                    if (product.images) {
                        setExistingImages(product.images);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setError('Failed to fetch product data.');
                    setLoading(false);
                });
        }
    }, [isEdit, id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handlePetTypeChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const petTypes = checked ? [...prev.petTypes, value] : prev.petTypes.filter(pt => pt !== value);
            return { ...prev, petTypes };
        });
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleDeleteExistingImage = (publicId) => {
        setExistingImages(existingImages.filter(img => img.publicId !== publicId));
        setDeletedImages([...deletedImages, publicId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- FORM VALIDATION ---
        const requiredFields = {
            'Name': formData.name,
            'Description': formData.description,
            'Price': formData.price,
            'Stock Quantity': formData.inventory.quantity
        };

        for (const [fieldName, value] of Object.entries(requiredFields)) {
            if (!value || String(value).trim() === '') {
                setError(`${fieldName} is a required field.`);
                return;
            }
        }
        if (Number(formData.price) <= 0 || Number(formData.inventory.quantity) < 0) {
            setError("Price must be greater than zero, and stock cannot be negative.");
            return;
        }
        // --- END VALIDATION ---

        setLoading(true);
        setError(null);

        const submissionData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                submissionData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                submissionData.append(key, JSON.stringify(value));
            }
            else {
                submissionData.append(key, value);
            }
        });

        images.forEach(image => {
            submissionData.append('images', image);
        });

        if (deletedImages.length > 0) {
            deletedImages.forEach(publicId => {
                submissionData.append('deleteImages', publicId);
            });
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (isEdit) {
                await api.put(`/products/${id}`, submissionData, config);
            } else {
                await api.post('/products', submissionData, config);
            }
            navigate('/shop-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save product.');
            setLoading(false);
        }
    };

    if (loading && isEdit) return <div>Loading product...</div>;

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                <fieldset className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <legend className="text-lg font-semibold mb-2">Basic Information</legend>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="food">Food</option>
                                <option value="toy">Toy</option>
                                <option value="accessory">Accessory</option>
                                <option value="health">Health</option>
                                <option value="grooming">Grooming</option>
                                <option value="housing">Housing</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Subcategory</label>
                        <input type="text" name="subcategory" id="subcategory" value={formData.subcategory} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                </fieldset>

                <fieldset className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <legend className="text-lg font-semibold mb-2">Targeting</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pet Types</label>
                        <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
                            {petTypeOptions.map(type => (
                                <label key={type} className="flex items-center">
                                    <input type="checkbox" value={type} checked={formData.petTypes.includes(type)} onChange={handlePetTypeChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-2 text-sm text-gray-600 capitalize">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                        <input type="text" id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagAdd} placeholder="Type a tag and press Enter" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-1 bg-gray-200 text-sm rounded-full">
                                    {tag}
                                    <button type="button" onClick={() => handleTagRemove(tag)} className="ml-2 text-gray-600 hover:text-gray-800">&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </fieldset>

                <fieldset className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <legend className="text-lg font-semibold mb-2">Pricing & Inventory</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">Original Price ($)</label>
                            <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="Optional" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="discount.percentage" className="block text-sm font-medium text-gray-700">Discount (%)</label>
                            <input type="number" name="discount.percentage" id="discount.percentage" value={formData.discount.percentage} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="discount.validUntil" className="block text-sm font-medium text-gray-700">Discount Valid Until</label>
                            <input type="date" name="discount.validUntil" id="discount.validUntil" value={formData.discount.validUntil} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="inventory.quantity" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input type="number" name="inventory.quantity" id="inventory.quantity" value={formData.inventory.quantity} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="ml-2 text-sm font-medium text-gray-700">Product is Active</span>
                            </label>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <legend className="text-lg font-semibold mb-2">Specifications</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="specifications.weight" className="block text-sm font-medium text-gray-700">Weight</label>
                            <input type="text" name="specifications.weight" id="specifications.weight" value={formData.specifications.weight} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="specifications.dimensions" className="block text-sm font-medium text-gray-700">Dimensions</label>
                            <input type="text" name="specifications.dimensions" id="specifications.dimensions" value={formData.specifications.dimensions} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="specifications.material" className="block text-sm font-medium text-gray-700">Material</label>
                            <input type="text" name="specifications.material" id="specifications.material" value={formData.specifications.material} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="specifications.ageRange" className="block text-sm font-medium text-gray-700">Age Range</label>
                            <input type="text" name="specifications.ageRange" id="specifications.ageRange" value={formData.specifications.ageRange} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="specifications.ingredients" className="block text-sm font-medium text-gray-700">Ingredients</label>
                        <textarea name="specifications.ingredients" id="specifications.ingredients" value={formData.specifications.ingredients} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                </fieldset>

                <fieldset className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <legend className="text-lg font-semibold mb-2">Images</legend>
                    <div>
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
                        <input type="file" name="images" id="images" onChange={handleImageChange} multiple accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {existingImages.map((img) => (
                                <div key={img.publicId} className="relative">
                                    <img src={img.url} alt="Existing product" className="h-24 w-full object-cover rounded-md" />
                                    <button type="button" onClick={() => handleDeleteExistingImage(img.publicId)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none text-xs">&times;</button>
                                </div>
                            ))}
                            {imagePreviews.map((preview, index) => (
                                <img key={index} src={preview} alt="Product preview" className="h-24 w-full object-cover rounded-md" />
                            ))}
                        </div>
                    </div>
                </fieldset>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Back
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm; 