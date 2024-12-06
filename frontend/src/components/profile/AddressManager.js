import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import useForm from '../../hooks/useForm';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { values, errors, handleChange, handleBlur, validateForm, setValues, resetForm } = useForm(
    {
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
    },
    {
      label: [{ type: 'required' }],
      street: [{ type: 'required' }],
      city: [{ type: 'required' }],
      state: [{ type: 'required' }],
      zipCode: [{ type: 'required' }],
    }
  );

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAddresses();
      setAddresses(response.data);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingId) {
        await userAPI.updateAddress(editingId, values);
        toast.success('Address updated successfully');
      } else {
        await userAPI.addAddress(values);
        toast.success('Address added successfully');
      }
      loadAddresses();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setValues(address);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      await userAPI.deleteAddress(id);
      toast.success('Address deleted successfully');
      loadAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Delivery Addresses</h3>
        <Button onClick={() => setShowModal(true)}>Add New Address</Button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">
                  {address.label}
                  {address.isDefault && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Address Label (e.g., Home, Work)"
            name="label"
            value={values.label}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.label}
            required
          />

          <Input
            label="Street Address"
            name="street"
            value={values.street}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.street}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.city}
              required
            />

            <Input
              label="State"
              name="state"
              value={values.state}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.state}
              required
            />
          </div>

          <Input
            label="ZIP Code"
            name="zipCode"
            value={values.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.zipCode}
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={values.isDefault}
              onChange={(e) => handleChange({
                target: { name: 'isDefault', value: e.target.checked }
              })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-600">
              Set as default address
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingId ? 'Update' : 'Add'} Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddressManager;
