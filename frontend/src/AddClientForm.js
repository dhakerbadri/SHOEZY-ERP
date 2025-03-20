import React, { useState } from 'react';
import API from './services/api'; // Ensure API is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function AddClientForm({ onClientAdded, choices }) {
  const [step, setStep] = useState(1); // Step 1: Client Info, Step 2: Transaction Details
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
  const [clientId, setClientId] = useState(null); // Store the client ID after creation

  // Handle client info form submission
  const handleClientSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Add the client
      const clientResponse = await API.post('/clients', clientData);
      if (clientResponse.status === 201) {
        const { client } = clientResponse.data;
        setClientId(client._id); // Store the client ID
        setStep(2); // Move to the transaction form
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
      // Step 2: Add the transaction
      const transactionResponse = await API.post('/transactionDetails/addWithDetails', {
        clientId: clientId, // Use the stored client ID
        transactionData: {
          date_purchase: transactionData.date_purchase,
          payment_method: transactionData.payment_method,
          amount: transactionData.transaction_details.reduce(
            (sum, detail) => sum + detail.quantity * detail.price_per_unit,
            0
          ),
        },
        detailsArray: transactionData.transaction_details.map((detail) => ({
          choiceId: detail.choiceId,
          purchase_type: 'product', // Match your backend validation
          quantity: detail.quantity,
          price_per_unit: detail.price_per_unit,
          total_price: detail.quantity * detail.price_per_unit,
        })),
      });

      if (transactionResponse.status === 201) {
        alert('Client and transaction added successfully!');
        onClientAdded(); // Refresh the client list
      }
    } catch (error) {
      console.error('Error adding transaction:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || error.message}`);
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