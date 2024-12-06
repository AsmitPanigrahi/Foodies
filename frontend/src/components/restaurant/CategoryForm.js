import React, { useState } from 'react';
import { useMenu } from '../../context/MenuContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useForm from '../../hooks/useForm';

const CategoryForm = ({ restaurantId, category = null, onSuccess, onCancel }) => {
  const { addCategory, updateCategory } = useMenu();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateForm } = useForm(
    {
      name: category?.name || '',
      description: category?.description || '',
      sortOrder: category?.sortOrder || 0,
    },
    {
      name: [{ type: 'required' }, { type: 'length', min: 2, max: 30 }],
      description: [{ type: 'length', max: 100 }],
      sortOrder: [{ type: 'required' }],
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      let result;
      if (category) {
        result = await updateCategory(restaurantId, category.id, values);
      } else {
        result = await addCategory(restaurantId, values);
      }

      if (result) {
        onSuccess(result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Category Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        required
      />

      <Input
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.description}
        multiline
      />

      <Input
        label="Sort Order"
        name="sortOrder"
        type="number"
        value={values.sortOrder}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.sortOrder}
        required
        helperText="Lower numbers appear first"
      />

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {category ? 'Update' : 'Add'} Category
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
