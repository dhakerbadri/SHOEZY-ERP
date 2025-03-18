import React, { useState, useEffect } from 'react';

function AddClientForm({ onClientAdded, initialData }) {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone_number: '',
        size: '',
    });

    // Pre-fill the form if initialData is provided
    useEffect(() => {
        if (initialData) {
            setFormData({
                firstname: initialData.firstname,
                lastname: initialData.lastname,
                email: initialData.email,
                phone_number: initialData.phone_number,
                size: initialData.size,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onClientAdded(formData); // Call the parent function to handle submission
    };

    return (
        <form onSubmit={handleSubmit} className="add-client-form">
            <h2>{initialData ? 'Update Client' : 'Add New Client'}</h2>
            <div className="form-group">
                <label>First Name</label>
                <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Last Name</label>
                <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Size</label>
                <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" className="submit-button">
                {initialData ? 'Update Client' : 'Add Client'}
            </button>
        </form>
    );
}

export default AddClientForm;