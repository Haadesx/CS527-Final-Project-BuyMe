import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAlertsQuery, useDeleteAlertMutation } from '../slices/alertsApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';

const NotificationsPage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { data: alerts, isLoading, error, refetch } = useGetAlertsQuery();
    const [deleteAlert] = useDeleteAlertMutation();

    useEffect(() => {
        if (userInfo) {
            refetch();
        }
    }, [userInfo, refetch]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
            try {
                await deleteAlert(id).unwrap();
                toast.success('Alert deleted');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 font-serif text-white">Notifications & Alerts</h1>

            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant="danger">{error?.data?.message || error.error}</Message>
            ) : (
                <div className="bg-gray-900 shadow-md rounded-lg p-6">
                    {alerts && alerts.length === 0 ? (
                        <Message>No active alerts found.</Message>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {alerts.map((alert) => (
                                <li key={alert._id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-semibold text-emerald-800">
                                            Keyword: <span className="font-bold">{alert.keyword}</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(alert.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(alert._id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
