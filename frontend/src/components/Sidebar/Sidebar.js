import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBox, faBars, faTimes,faChartBar } from '@fortawesome/free-solid-svg-icons'; // Import icons
import './Sidebar.css';

function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true); // State to manage collapse

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} />
            </button>
            <h2 className="sidebar-title">Shoezy</h2>
            <ul className="sidebar-menu">
                <li>
                    <Link to="/clients" className="sidebar-link">
                        <FontAwesomeIcon icon={faUsers} className="sidebar-icon" />
                        {!isCollapsed && <span>Client Management</span>}
                    </Link>
                </li>
                <li>
                    <Link to="/inventory" className="sidebar-link">
                        <FontAwesomeIcon icon={faBox} className="sidebar-icon" />
                        {!isCollapsed && <span>Inventory</span>}
                    </Link>
                </li>
                <li>
                    <Link to="/stats" className="sidebar-link">
                        <FontAwesomeIcon icon={faChartBar} />
                        {!isCollapsed && <span>Insights</span>}
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;