import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

function ManageChoicesForm({ choices, onAddChoice, onDeleteChoice, onUpdateChoice }) {
    const [newChoice, setNewChoice] = useState({ name: '', type: '' });
    const [choiceToUpdate, setChoiceToUpdate] = useState(null);

    const handleAddChoice = (e) => {
        e.preventDefault();
        onAddChoice(newChoice);
        setNewChoice({ name: '', type: '' });
    };

    const handleUpdateChoice = (e) => {
        e.preventDefault();
        onUpdateChoice(choiceToUpdate);
        setChoiceToUpdate(null);
    };

    return (
        <div className="manage-choices-form">
            <form onSubmit={handleAddChoice}>
                <h3>Add New Choice</h3>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newChoice.name}
                        onChange={(e) => setNewChoice({ ...newChoice, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Type</label>
                    <select
                        value={newChoice.type}
                        onChange={(e) => setNewChoice({ ...newChoice, type: e.target.value })}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="product">Product</option>
                        <option value="service">Service</option>
                    </select>
                </div>
                <button type="submit" className="submit-button">Add Choice</button>
            </form>

            <div className="choices-list">
                <h3>Existing Choices</h3>
                <div className="scrollable-list">
                    {choices.map(choice => (
                        <div key={choice._id} className="choice-item">
                            <p>{choice.name} ({choice.type})</p>
                            <div className="choice-actions">
                                <button
                                    className="action-button update-button"
                                    onClick={() => setChoiceToUpdate(choice)}
                                    title="Edit"
                                >
                                    <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button
                                    className="action-button delete-button"
                                    onClick={() => onDeleteChoice(choice._id)}
                                    title="Delete"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {choiceToUpdate && (
                <form onSubmit={handleUpdateChoice}>
                    <h3>Update Choice</h3>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Name"
                            value={choiceToUpdate.name}
                            onChange={(e) => setChoiceToUpdate({ ...choiceToUpdate, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={choiceToUpdate.type}
                            onChange={(e) => setChoiceToUpdate({ ...choiceToUpdate, type: e.target.value })}
                            required
                        >
                            <option value="product">Product</option>
                            <option value="service">Service</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-button">Update Choice</button>
                </form>
            )}
        </div>
    );
}

export default ManageChoicesForm;