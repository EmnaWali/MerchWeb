import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './styles.css'; // Assurez-vous que ce fichier contient les styles appropriés
import logo from './logo1.png'; // Assurez-vous d'avoir un fichier logo.png ou ajustez le chemin selon votre logo


const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer les informations d'authentification de l'utilisateur (comme le token)
    localStorage.removeItem('authToken');
    navigate("/");
  };

  return (
    
    <div className="layout">
      {location.pathname !== '/' && (
        <>
          {/* Navbar */}
          <nav
            id="main-navbar"
            className="custom-navbar navbar navbar-expand-lg navbar-light fixed-top"
          >
            {/* Container wrapper */}
            <div className="container-fluid">
              {/* Toggle button */}
              <button
                className="navbar-toggler"
                type="button"
                data-mdb-toggle="collapse"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <i className="fas fa-bars"></i>
              </button>

              {/* Brand */}
              <Link className="navbar-brand" to="/ReactBigCalendar">
                <img
                  src={logo}
                  alt="Logo"
                />
              </Link>
              <div className="no-print">
              {/* Right links */}
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto d-flex flex-row">
                  <li className="nav-item">
                    <Link className="nav-link" to="/missions">
                      Mission List
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/RapportPrix">
                      Rapport Prix
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/rapportQte">
                      Rapport Quantité
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/RapportFacing">
                      Rapport Facings
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-link" onClick={handleLogout}>
                    Logout
                    <i className="bi bi-box-arrow-right"></i>
                      
                    </button>
                  </li>
                </ul>
              </div>
              </div>
            </div>
          </nav>

          <div className="content">
            {children}
          </div>
        </>
      )}
      {location.pathname === '/' && children}
    </div>
    
  );
};

export default Layout;
