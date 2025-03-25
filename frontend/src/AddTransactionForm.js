import React, { useState, useEffect } from 'react';

function AddTransactionForm({ 
  onTransactionAdded, 
  choices,
  initialTransaction // Add this prop for edit mode
}) {
  const [formData, setFormData] = useState({
    date_purchase: '',
    payment_method: '',
    transaction_details: [{ choiceId: '', quantity: 1, price_per_unit: 0 }],
  });

  // Step 5: Add this useEffect to handle pre-filling for edits
// AddTransactionForm.js
useEffect(() => {
  if (initialTransaction) {
      // Ensure proper population of initial data
      const formattedDetails = initialTransaction.transaction_details.map(detail => ({
          _id: detail._id,
          choiceId: detail.choiceId?._id || detail.choiceId,
          quantity: detail.quantity,
          price_per_unit: detail.price_per_unit,
          purchase_type: detail.purchase_type || 'product'
      }));

      setFormData({
          date_purchase: initialTransaction.date_purchase?.split('T')[0] || '',
          payment_method: initialTransaction.payment_method || '',
          transaction_details: formattedDetails
      });
  }
}, [initialTransaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailChange = (e, index, field) => {
    const { value } = e.target;
    const updatedDetails = [...formData.transaction_details];
    updatedDetails[index][field] = field === 'quantity' || field === 'price_per_unit' 
      ? Number(value) 
      : value;
    setFormData({ ...formData, transaction_details: updatedDetails });
  };

  const handleAddDetail = () => {
    setFormData({
      ...formData,
      transaction_details: [
        ...formData.transaction_details,
        { choiceId: '', quantity: 1, price_per_unit: 0 },
      ],
    });
  };

  const handleRemoveDetail = (index) => {
    const updatedDetails = [...formData.transaction_details];
    updatedDetails.splice(index, 1);
    setFormData({ ...formData, transaction_details: updatedDetails });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate total_price automatically
    const transactionData = {
      ...formData,
      transaction_details: formData.transaction_details.map(detail => ({
        ...detail,
        total_price: detail.quantity * detail.price_per_unit,
        purchase_type: detail.purchase_type || 'product',
      })),
    };
    onTransactionAdded(transactionData);
  };

  return (
    <form onSubmit={handleSubmit} className="add-transaction-form">
      <h2>{initialTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
      <div className="form-group">
        <label>Date Purchase</label>
        <input
          type="date"
          name="date_purchase"
          value={formData.date_purchase}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Payment Method</label>
        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          required
        >
          <option value="">Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>
      <div className="form-group">
        <label>Transaction Details</label>
        {formData.transaction_details.map((detail, index) => (
          <div key={index} className="transaction-detail">
            <select
              value={detail.choiceId}
              onChange={(e) => handleDetailChange(e, index, 'choiceId')}
              required
            >
              <option value="">Select Product/Service</option>
              {choices.map(choice => (
                <option key={choice._id} value={choice._id}>
                  {choice.name} ({choice.type})
                </option>
              ))}
            </select>
            <div className="detail-inputs">
              <div>
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={detail.quantity}
                  onChange={(e) => handleDetailChange(e, index, 'quantity')}
                  required
                />
              </div>
              <div>
                <label>Price per Unit:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={detail.price_per_unit}
                  onChange={(e) => handleDetailChange(e, index, 'price_per_unit')}
                  required
                />
              </div>
              {formData.transaction_details.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveDetail(index)}
                  className="remove-detail-button"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button 
          type="button" 
          onClick={handleAddDetail}
          className="add-detail-button"
        >
          Add Another Detail
        </button>
      </div>
      <button type="submit" className="submit-button">
        {initialTransaction ? 'Update Transaction' : 'Add Transaction'}
      </button>
    </form>
  );
}

export default AddTransactionForm;