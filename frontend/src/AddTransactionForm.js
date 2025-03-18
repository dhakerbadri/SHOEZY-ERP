import React, { useState } from 'react';


function AddTransactionForm({ onTransactionAdded, choices }) {
  const [formData, setFormData] = useState({
    date_purchase: '',
    payment_method: '',
    transaction_details: [{ choiceId: '', quantity: 1, price_per_unit: 0 }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailChange = (e, index, field) => {
    const { value } = e.target;
    const updatedDetails = [...formData.transaction_details];
    updatedDetails[index][field] = value;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate total_price automatically
    const transactionData = {
      ...formData,
      transaction_details: formData.transaction_details.map(detail => ({
        ...detail,
        total_price: detail.quantity * detail.price_per_unit,
        purchase_type: 'product',
      })),
    };
    onTransactionAdded(transactionData);
  };

  return (
    <form onSubmit={handleSubmit} className="add-transaction-form">
      <h2>Add Transaction</h2>
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
            <ul>
            <li>Quantity :</li>
            <input
              type="number"
              placeholder="Quantity"
              value={detail.quantity}
              onChange={(e) => handleDetailChange(e, index, 'quantity')}
              required
            />
            </ul>
           <ul>
            <li>Price per Unit :</li>
            <input
              type="number"
              placeholder="Price per Unit"
              value={detail.price_per_unit}
              onChange={(e) => handleDetailChange(e, index, 'price_per_unit')}
              required
            />
           </ul>
          </div>
        ))}
        <button type="button" onClick={handleAddDetail}>
          Add Another Detail
        </button>
      </div>
      <button type="submit" className="submit-button">
        Add Transaction
      </button>
    </form>
  );
}

export default AddTransactionForm;