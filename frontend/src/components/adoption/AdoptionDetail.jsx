import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adoptionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AdoptionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [adoption, setAdoption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchAdoptionDetail();
    }, [id]);

    const fetchAdoptionDetail = async () => {
        try {
            setLoading(true);
            const response = await adoptionAPI.getAdoptionById(id);
            setAdoption(response.data.application);
            setNotes(response.data.application.reviewNotes || '');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch adoption details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            setUpdating(true);
            await adoptionAPI.updateAdoptionStatus(id, status, notes);
            await fetchAdoptionDetail(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleScheduleMeeting = async () => {
        const date = prompt('Enter meeting date (YYYY-MM-DD HH:MM):');
        const location = prompt('Enter meeting location:');

        if (date && location) {
            try {
                setUpdating(true);
                await adoptionAPI.scheduleMeeting(id, date, location);
                await fetchAdoptionDetail();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to schedule meeting');
            } finally {
                setUpdating(false);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center text-red-500">Error: {error}</div>
            </div>
        );
    }

    if (!adoption) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center">Adoption application not found</div>
            </div>
        );
    }

    const isPetOwner = adoption.pet?.owner === user?.userId || user?.role === 'admin';
    const isApplicant = adoption.applicant?.user === user?.userId;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Adoption Application</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        ← Back
                    </button>
                </div>

                {/* Status Badge */}
                <div className="mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${adoption.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        adoption.status === 'approved' ? 'bg-green-100 text-green-800' :
                            adoption.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                adoption.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                        {adoption.status.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pet Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Pet Information</h2>
                        {adoption.pet?.images?.[0] && (
                            <img
                                src={adoption.pet.images[0].url}
                                alt={adoption.pet.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {adoption.pet?.name}</p>
                            <p><strong>Breed:</strong> {adoption.pet?.breed}</p>
                            <p><strong>Species:</strong> {adoption.pet?.species}</p>
                            <p><strong>Age:</strong> {adoption.pet?.age?.value} {adoption.pet?.age?.unit}</p>
                            <p><strong>Gender:</strong> {adoption.pet?.gender}</p>
                        </div>
                    </div>

                    {/* Applicant Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Applicant Information</h2>
                        <div className="space-y-2">
                            <p><strong>Name:</strong> {adoption.applicant?.name}</p>
                            <p><strong>Email:</strong> {adoption.applicant?.email}</p>
                            <p><strong>Phone:</strong> {adoption.applicant?.phone}</p>
                            <p><strong>Applied Date:</strong> {new Date(adoption.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Application Details */}
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Application Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p><strong>Living Arrangement:</strong> {adoption.livingArrangement}</p>
                            <p><strong>Work Schedule:</strong> {adoption.workSchedule}</p>
                            <p><strong>Experience:</strong> {adoption.experience}</p>
                            <p><strong>Has Other Pets:</strong> {adoption.hasOtherPets ? 'Yes' : 'No'}</p>
                            {adoption.hasOtherPets && (
                                <p><strong>Other Pets Details:</strong> {adoption.otherPetsDetails}</p>
                            )}
                        </div>
                        <div>
                            <p><strong>Has Children:</strong> {adoption.hasChildren ? 'Yes' : 'No'}</p>
                            {adoption.hasChildren && (
                                <p><strong>Children Ages:</strong> {adoption.childrenAges}</p>
                            )}
                            <p><strong>Reason for Adoption:</strong> {adoption.reasonForAdoption}</p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <p><strong>Name:</strong> {adoption.emergencyContact?.name}</p>
                        <p><strong>Phone:</strong> {adoption.emergencyContact?.phone}</p>
                        <p><strong>Relationship:</strong> {adoption.emergencyContact?.relationship}</p>
                    </div>
                </div>

                {/* References */}
                {adoption.references && adoption.references.length > 0 && (
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">References</h2>
                        <div className="space-y-4">
                            {adoption.references.map((ref, index) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4">
                                    <p><strong>Name:</strong> {ref.name}</p>
                                    <p><strong>Phone:</strong> {ref.phone}</p>
                                    <p><strong>Relationship:</strong> {ref.relationship}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Meeting Schedule */}
                {adoption.meetingSchedule && (
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Meeting Schedule</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <p><strong>Date:</strong> {new Date(adoption.meetingSchedule.date).toLocaleString()}</p>
                            <p><strong>Location:</strong> {adoption.meetingSchedule.location}</p>
                            {adoption.meetingSchedule.notes && (
                                <p><strong>Notes:</strong> {adoption.meetingSchedule.notes}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Review Notes */}
                {adoption.reviewNotes && (
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Review Notes</h2>
                        <p>{adoption.reviewNotes}</p>
                    </div>
                )}

                {/* Actions for Pet Owner */}
                {isPetOwner && adoption.status === 'pending' && (
                    <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Actions</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add review notes..."
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={updating}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={updating}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Reject'}
                                </button>
                                <button
                                    onClick={handleScheduleMeeting}
                                    disabled={updating}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updating ? 'Scheduling...' : 'Schedule Meeting'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions for Applicant */}
                {isApplicant && adoption.status === 'pending' && (
                    <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Actions</h2>
                        <button
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this application?')) {
                                    try {
                                        await adoptionAPI.cancelApplication(id);
                                        navigate(-1);
                                    } catch (err) {
                                        alert(err.response?.data?.message || 'Failed to cancel application');
                                    }
                                }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            Cancel Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdoptionDetail; 