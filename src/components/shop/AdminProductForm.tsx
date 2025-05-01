import React, { useState } from 'react';
import { ShopService, Product } from '@/services/shopService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface AdminProductFormProps {
  product?: Product;
  onSave: () => void;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ product, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.imageData || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!price || price <= 0) errs.price = 'Price must be greater than 0';
    if (!stock || stock < 0) errs.stock = 'Stock must be 0 or more';
    if (!product && !imageFile) errs.image = 'Image is required';
    return errs;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      if (product) {
        await ShopService.updateProduct(product.id!, { name, description, price, stock, imageData: imagePreview }, imageFile || undefined);
        toast.success('Product updated successfully');
      } else if (imageFile) {
        await ShopService.addProduct({ name, description, price, stock, imageData: '' }, imageFile);
        toast.success('Product added successfully');
      }
      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onSave}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex space-x-4 mb-6 border-b">
          <button
            className={`pb-2 px-1 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('details')}
          >
            Additional Details
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'basic' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter product name"
                    disabled={loading}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      className="w-full border rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter product description"
                  disabled={loading}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-contain" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={() => {
                            setImagePreview('');
                            setImageFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={loading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              </div>
            </>
          )}

          {activeTab === 'details' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                min={0}
                placeholder="Enter stock quantity"
                disabled={loading}
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onSave}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {product ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm; 