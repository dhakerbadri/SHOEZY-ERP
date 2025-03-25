import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import API from './services/api';
import AddClientForm from './AddClientForm';
import UpdateClientForm from './UpdateClientForm';
import AddTransactionForm from './AddTransactionForm';
import ManageChoicesForm from './ManageChoicesForm';
import Modal from './Modal';
import Sidebar from './Sidebar';
import Stats from './Stats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrash, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [showAddClientForm, setShowAddClientForm] = useState(false);
    const [showUpdateClientForm, setShowUpdateClientForm] = useState(false);
    const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
    const [showManageChoicesForm, setShowManageChoicesForm] = useState(false);
    const [clientToUpdate, setClientToUpdate] = useState(null);
    const [clientForTransaction, setClientForTransaction] = useState(null);
    const [choices, setChoices] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [clientsPerPage] = useState(8);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchClients();
        fetchChoices();
    }, []);

    const fetchClients = () => {
        API.get('/clients')
            .then(response => setClients(response.data))
            .catch(error => setError('Error fetching clients: ' + error.message));
    };

    const fetchChoices = () => {
        API.get('/choices')
            .then(response => setChoices(response.data))
            .catch(error => setError('Error fetching choices: ' + error.message));
    };

    const fetchTransactions = async (clientId) => {
        setIsLoading(true);
        try {
            const response = await API.get(`/transactions/client/${clientId}`);
            setTransactions(response.data);
        } catch (error) {
            setError('Error fetching transactions: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshTransactions = async () => {
        if (selectedClient?._id) {
            await fetchTransactions(selectedClient._id);
        }
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setTransactions([]);
        fetchTransactions(client._id);
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await API.delete(`/transactions/${transactionId}`);
                await refreshTransactions();
                alert('Transaction deleted successfully');
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Failed to delete transaction');
            }
        }
    };

    const handleUpdateTransaction = async (transaction) => {
        try {
            setIsLoading(true);
            const response = await API.get(`/transactions/${transaction._id}`);
            setTransactionToEdit(response.data);
            setShowAddTransactionForm(true);
        } catch (error) {
            console.error('Error fetching transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClient = async (newClient) => {
        try {
            const clientResponse = await API.post('/clients', newClient);
            if (clientResponse.status === 201) {
                const { client } = clientResponse.data;
                alert('Client added successfully!');
                setShowAddClientForm(false);
                fetchClients();
                setClientForTransaction(client);
                setShowAddTransactionForm(true);
            }
        } catch (error) {
            setError('Error adding client: ' + error.message);
        }
    };

    const handleAddTransactionSubmit = async (transactionData) => {
        try {
            if (transactionToEdit) {
                await API.put(`/transactions/${transactionToEdit._id}`, {
                    transactionData: {
                        date_purchase: transactionData.date_purchase,
                        payment_method: transactionData.payment_method
                    },
                    detailsArray: transactionData.transaction_details
                });
                alert('Transaction updated successfully!');
            } else {
                if (!clientForTransaction?._id) {
                    alert('Client ID missing');
                    return;
                }
                await API.post('/transactionDetails/addWithDetails', {
                    clientId: clientForTransaction._id,
                    transactionData: {
                        date_purchase: transactionData.date_purchase,
                        payment_method: transactionData.payment_method,
                        amount: transactionData.transaction_details.reduce(
                            (sum, detail) => sum + detail.quantity * detail.price_per_unit, 0
                        ),
                    },
                    detailsArray: transactionData.transaction_details.map(detail => ({
                        choiceId: detail.choiceId,
                        purchase_type: 'product',
                        quantity: detail.quantity,
                        price_per_unit: detail.price_per_unit,
                        total_price: detail.quantity * detail.price_per_unit,
                    })),
                });
                alert('Transaction added successfully!');
            }
            
            setShowAddTransactionForm(false);
            setTransactionToEdit(null);
            await refreshTransactions();
        } catch (error) {
            console.error('Error:', error);
            alert(`Operation failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddTransaction = (client) => {
        setClientForTransaction(client);
        setShowAddTransactionForm(true);
    };

    const handleDeleteClient = (clientId) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            API.delete(`/clients/${clientId}`)
                .then(response => {
                    if (response.status === 200) {
                        alert('Client deleted successfully!');
                        fetchClients();
                    }
                })
                .catch(error => setError('Error deleting client: ' + error.message));
        }
    };

    const handleUpdateClient = (client) => {
        setClientToUpdate(client);
        setShowUpdateClientForm(true);
    };

    const handleUpdateSubmit = (updatedClient) => {
        API.put(`/clients/${clientToUpdate._id}`, updatedClient)
            .then(response => {
                if (response.status === 200) {
                    alert('Client updated successfully!');
                    setShowUpdateClientForm(false);
                    fetchClients();
                }
            })
            .catch(error => setError('Error updating client: ' + error.message));
    };

    const handleAddChoice = (newChoice) => {
        API.post('/choices', newChoice)
            .then(response => {
                if (response.status === 201) {
                    alert('Choice added successfully!');
                    fetchChoices();
                }
            })
            .catch(error => setError('Error adding choice: ' + error.message));
    };

    const handleDeleteChoice = (choiceId) => {
        if (window.confirm('Are you sure you want to delete this choice?')) {
            API.delete(`/choices/${choiceId}`)
                .then(response => {
                    if (response.status === 200) {
                        alert('Choice deleted successfully!');
                        fetchChoices();
                    }
                })
                .catch(error => setError('Error deleting choice: ' + error.message));
        }
    };

    const handleUpdateChoice = (updatedChoice) => {
        API.put(`/choices/${updatedChoice._id}`, updatedChoice)
            .then(response => {
                if (response.status === 200) {
                    alert('Choice updated successfully!');
                    fetchChoices();
                }
            })
            .catch(error => setError('Error updating choice: ' + error.message));
    };

    // Pagination logic
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

    const totalPages = Math.ceil(clients.length / clientsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <h1 className="app-title">Client Management</h1>
                                {error && <div className="error-message">{error}</div>}
                                <div className="action-buttons">
                                    <button
                                        className="add-client-button"
                                        onClick={() => setShowAddClientForm(!showAddClientForm)}
                                    >
                                        {showAddClientForm ? 'Cancel' : 'Add New Client'}
                                    </button>
                                    <button
                                        className="manage-choices-button"
                                        onClick={() => setShowManageChoicesForm(true)}
                                    >
                                        <FontAwesomeIcon icon={faCog} /> Manage Choices
                                    </button>
                                </div>

                                {showAddClientForm && (
                                    <AddClientForm
                                        onClientAdded={handleAddClient}
                                        choices={choices}
                                        setShowAddClientForm={setShowAddClientForm}
                                        fetchClients={fetchClients}
                                        setClientForTransaction={setClientForTransaction}
                                        setShowAddTransactionForm={setShowAddTransactionForm}
                                    />
                                )}

                                <Modal isOpen={showUpdateClientForm} onClose={() => setShowUpdateClientForm(false)}>
                                    <UpdateClientForm
                                        onClientAdded={handleUpdateSubmit}
                                        initialData={clientToUpdate}
                                    />
                                </Modal>

                                <Modal isOpen={showAddTransactionForm} onClose={() => setShowAddTransactionForm(false)}>
                                    <AddTransactionForm
                                        onTransactionAdded={handleAddTransactionSubmit}
                                        choices={choices}
                                        initialTransaction={transactionToEdit}
                                    />
                                </Modal>

                                <Modal isOpen={showManageChoicesForm} onClose={() => setShowManageChoicesForm(false)}>
                                    <ManageChoicesForm
                                        choices={choices}
                                        onAddChoice={handleAddChoice}
                                        onDeleteChoice={handleDeleteChoice}
                                        onUpdateChoice={handleUpdateChoice}
                                    />
                                </Modal>

                                <div className="clients-section">
                                    <h2 className="section-title">Clients</h2>
                                    <div className="clients-grid">
                                        {currentClients.map(client => (
                                            <div key={client._id} className="client-card">
                                                <h3 className="client-name">{client.firstname} {client.lastname}</h3>
                                                <div className="client-details">
                                                    <p><strong>Email:</strong> {client.email}</p>
                                                    <p><strong>Phone:</strong> {client.phone_number}</p>
                                                    <p><strong>Size:</strong> {client.size}</p>
                                                </div>
                                                <div className="client-actions">
                                                    <button
                                                        className="action-button view-button"
                                                        onClick={() => handleClientClick(client)}
                                                        title="View Transactions"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    <button
                                                        className="action-button update-button"
                                                        onClick={() => handleUpdateClient(client)}
                                                        title="Update Client"
                                                    >
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </button>
                                                    <button
                                                        className="action-button delete-button"
                                                        onClick={() => handleDeleteClient(client._id)}
                                                        title="Delete Client"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button
                                                        className="action-button add-transaction-button"
                                                        onClick={() => handleAddTransaction(client)}
                                                        title="Add Transaction"
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pagination">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={currentPage === i + 1 ? 'active' : ''}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedClient && (
                                    <div className="transactions-section">
                                        <h2 className="section-title">
                                            Transactions for {selectedClient.firstname} {selectedClient.lastname}
                                        </h2>
                                        {isLoading ? (
                                            <p>Loading transactions...</p>
                                        ) : transactions.length === 0 ? (
                                            <p className="no-transactions-message">No transactions found for this client.</p>
                                        ) : (
                                            <div className="transactions-table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Payment Method</th>
                                                            <th>Amount</th>
                                                            <th>Details</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map(transaction => (
                                                            <tr key={transaction._id}>
                                                                <td>{new Date(transaction.date_purchase).toLocaleDateString()}</td>
                                                                <td>{transaction.payment_method}</td>
                                                                <td>${transaction.amount}</td>
                                                                <td>
                                                                    {transaction.transaction_details?.length > 0 ? (
                                                                        <ul className="details-list">
                                                                            {transaction.transaction_details.map(detail => (
                                                                                <li key={detail._id}>
                                                                                    <p><strong>Item:</strong> {detail.choiceId?.name || 'Unknown'}</p>
                                                                                    <p><strong>Qty:</strong> {detail.quantity}</p>
                                                                                    <p><strong>Price:</strong> ${detail.price_per_unit}</p>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p>No details</p>
                                                                    )}
                                                                </td>
                                                                <td className="transaction-actions">
                                                                    <button 
                                                                        onClick={() => handleUpdateTransaction(transaction)}
                                                                        className="action-button update-button"
                                                                        title="Edit"
                                                                    >
                                                                        <FontAwesomeIcon icon={faPen} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteTransaction(transaction._id)}
                                                                        className="action-button delete-button"
                                                                        title="Delete"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        }
                    />
                    <Route path="/stats" element={<Stats />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;