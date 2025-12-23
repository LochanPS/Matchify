import React from 'react';
import CategoryCard from './CategoryCard';

/**
 * Category list component
 * Displays all categories for a tournament
 */
const CategoryList = ({ categories, onRegister, registeredCategories, isLoading }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No categories available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.category_id}
          category={category}
          onRegister={onRegister}
          isRegistered={registeredCategories?.includes(category.category_id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default CategoryList;
