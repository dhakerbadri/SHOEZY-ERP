import React, { useState } from 'react';
import API from '../api/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import '../utils/App.css';
function AddClientForm({
  onClientAdded,
  choices,
  setShowAddClientForm,
  fetchClients,
  setShowAddTransactionForm,
}) {
  const [step, setStep] = useState(1);
  const [clientData, setClientData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_number: '',
    size: '',
  });
  const [transactionData, setTransactionData] = useState({
    date_purchase: '',
    payment_method: '',
    transaction_details: [{ choiceId: '', quantity: 1, price_per_unit: 0 }],
  });
  const [currentClientId, setCurrentClientId] = useState(null); // Add this state

  // Handle client info form submission
  const handleClientSubmit = async (e) => {
    e.preventDefault();

    try {
      const clientResponse = await API.post('/clients', clientData);
      if (clientResponse.status === 201) {
        const { client } = clientResponse.data;
        setCurrentClientId(client._id); // Store the client ID
        setStep(2);
      }
    } catch (error) {
      console.error('Error adding client:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle transaction form submission
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!currentClientId) {
        throw new Error("No client selected for transaction");
      }

      const transactionResponse = await API.post('/transactionDetails/addWithDetails', {
        clientId: currentClientId, // Use the stored client ID
        transactionData: {
          date_purchase: transactionData.date_purchase,
          payment_method: transactionData.payment_method,
        },
        detailsArray: transactionData.transaction_details.map(detail => ({
          choiceId: detail.choiceId,
          purchase_type: detail.purchase_type || 'product',
          quantity: Number(detail.quantity),
          price_per_unit: Number(detail.price_per_unit),
        }))
      });

      if (transactionResponse.status === 201) {
        alert('Transaction added successfully!');
        setShowAddClientForm(false);
        setShowAddTransactionForm(false);
        fetchClients();
      }
    } catch (error) {
      console.error('Transaction error:', error.response?.data || error.message);
      alert(`Transaction failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle changes in client form
  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  // Handle changes in transaction form
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionData({ ...transactionData, [name]: value });
  };

  // Handle changes in transaction details
  const handleDetailChange = (e, index, field) => {
    const { value } = e.target;
    const updatedDetails = [...transactionData.transaction_details];
    updatedDetails[index][field] = value;
    setTransactionData({ ...transactionData, transaction_details: updatedDetails });
  };

  // Add another transaction detail
  const handleAddDetail = () => {
    setTransactionData({
      ...transactionData,
      transaction_details: [
        ...transactionData.transaction_details,
        { choiceId: '', quantity: 1, price_per_unit: 0 },
      ],
    });
  };

  return (
    <div className="add-client-container">
      {step === 1 && (
        <div className="client-form">
          <h2>Add New Client (Step 1 of 2)</h2>
          <form onSubmit={handleClientSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstname"
                value={clientData.firstname}
                onChange={handleClientChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastname"
                value={clientData.lastname}
                onChange={handleClientChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={clientData.email}
                onChange={handleClientChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={clientData.phone_number}
                onChange={handleClientChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input
                type="text"
                name="size"
                value={clientData.size}
                onChange={handleClientChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Next: Add Transaction Details
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="transaction-form">
          <h2>Add Transaction Details (Step 2 of 2)</h2>
          <form onSubmit={handleTransactionSubmit}>
            <div className="form-group">
              <label>Date Purchase</label>
              <input
                type="date"
                name="date_purchase"
                value={transactionData.date_purchase}
                onChange={handleTransactionChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                name="payment_method"
                value={transactionData.payment_method}
                onChange={handleTransactionChange}
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
              {transactionData.transaction_details.map((detail, index) => (
                <div key={index} className="transaction-detail">
                  <select
                    value={detail.choiceId}
                    onChange={(e) => handleDetailChange(e, index, 'choiceId')}
                    required
                  >
                    <option value="">Select Product/Service</option>
                    {choices.map((choice) => (
                      <option key={choice._id} value={choice._id}>
                        {choice.name} ({choice.type})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={detail.quantity}
                    onChange={(e) => handleDetailChange(e, index, 'quantity')}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price per Unit"
                    value={detail.price_per_unit}
                    onChange={(e) => handleDetailChange(e, index, 'price_per_unit')}
                    required
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddDetail}>
                <FontAwesomeIcon icon={faPlus} /> Add Another Detail
              </button>
            </div>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddClientForm;