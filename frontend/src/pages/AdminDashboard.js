import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const active = response.data.filter(r => r.isActive).length;
      const pending = response.data.filter(r => !r.isApproved).length;
      
      setStats({
        totalRestaurants: total,
        activeRestaurants: active,
        pendingApprovals: pending
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestaurant = async (restaurantId) => {
    try {
      await restaurantAPI.update(restaurantId, { isApproved: true });
      toast.success('Restaurant approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve restaurant');
    }
  };

  const handleToggleActive = async (restaurantId, currentStatus) => {
    try {
      await restaurantAPI.update(restaurantId, { isActive: !currentStatus });
      toast.success('Restaurant status updated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update restaurant status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Restaurants</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {stats.totalRestaurants}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Active Restaurants</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.activeRestaurants}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.pendingApprovals}
          </p>
        </div>
      </div>

      {/* Restaurants List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Restaurants Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={restaurant.image || 'https://via.placeholder.com/40'}
                        alt={restaurant.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {restaurant.cuisine}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {restaurant.owner.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {restaurant.owner.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        restaurant.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        restaurant.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {restaurant.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!restaurant.isApproved && (
                      <button
                        onClick={() => handleApproveRestaurant(restaurant._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleToggleActive(restaurant._id, restaurant.isActive)
                      }
                      className={`${
                        restaurant.isActive
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {restaurant.isActive ? 'Deactivate' : 'Activate'}
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
};

export default AdminDashboard;
