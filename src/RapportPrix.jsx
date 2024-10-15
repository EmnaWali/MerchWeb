import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import "./styles.css";
import * as XLSX from "xlsx";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const RapportComponent = () => {
  const [date, setDate] = useState("");
  const [userId, setUserId] = useState("");
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workers, setWorkers] = useState([]);

  const fetchWorkers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}Merchandiser/GetMerchandisers`
      );
      setWorkers(response.data);
    } catch (error) {
      setError(error);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const fetchRapports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}Rapporting/GetRapport`,
        {
          params: {
            date: date,
            user_id: userId,
          },
        }
      );
      setRapports(response.data);
    } catch (error) {
      console.error("Error fetching rapports:", error);
      setError("Erreur lors de la récupération des rapports.");
    } finally {
      setLoading(false);
    }
  }, [date, userId]);

  useEffect(() => {
    fetchRapports();
  }, [fetchRapports]);

  const groupByDateAndClient = (rapports) => {
    const grouped = rapports.reduce((acc, rapport) => {
      const dateClientKey = `${new Date(
        rapport.missionDate
      ).toLocaleDateString()}-${rapport.raisonSocial}-${rapport.adresse}-${
        rapport.userName
      }`; // Changed this line
      if (!acc[dateClientKey]) {
        acc[dateClientKey] = [];
      }
      acc[dateClientKey].push(rapport);
      return acc;
    }, {});

    return grouped;
  };

  const groupedRapports = groupByDateAndClient(rapports);

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rapports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Prix");
    XLSX.writeFile(workbook, "Rapports.xlsx");
  };

  // Fonction pour calculer le prix ajusté
  const calculateAdjustedPrice = (
    prixArticleA,
    contenanceArticleA,
    contenanceArticleB
  ) => {
    if (contenanceArticleA === 0) {
      return 0; // Éviter une division par zéro
    }
    return (prixArticleA / contenanceArticleA) * contenanceArticleB;
  };

  // Fonction pour calculer le taux de marge
  const calculateMarginRate = (prixArticleB, prixAjusteArticleA) => {
    if (prixArticleB === 0) {
      return 0; // Éviter une division par zéro
    }
    return ((prixArticleB - prixAjusteArticleA) / prixArticleB) * 100;
  };

  return (
    <div style={styles.container}>
      <div className="no-print">
        <h2 style={styles.header}>Rapport Prix</h2>
        <div style={styles.formContainer} className="no-print">
          <div style={styles.formGroup}>
            <label style={styles.label}>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Marchandiseur:</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={styles.input}
            >
              <option value="">Marchandiseur</option>
              {workers.map((worker) => (
                <option key={worker.user_id} value={worker.user_id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handlePrint} style={styles.button}>
            <i className="bi bi-printer"></i>
          </button>
          <button onClick={exportToExcel} style={styles.button}>
            Exporter
            <i className="bi bi-file-earmark-spreadsheet"></i>
          </button>
        </div>
      </div>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : Object.keys(groupedRapports).length === 0 ? (
        <p style={styles.empty}>Aucun rapport à afficher.</p>
      ) : (
        Object.keys(groupedRapports).map((dateClientKey) => {
          const [dateKey, clientKey, adressekey] = dateClientKey.split("-");
          const groupedData = groupedRapports[dateClientKey];
          const groupedByArticle = groupedData.reduce((acc, rapport) => {
            if (!acc[rapport.article]) {
              acc[rapport.article] = [];
            }
            acc[rapport.article].push(rapport);
            return acc;
          }, {});

          return (
            <div key={dateClientKey} style={styles.tableContainer}>
              <h2 className="custom-heading">{` Mission affectée ${dateKey} | ${clientKey} ${adressekey}|${groupedData[0].userName}`}</h2>

              <Table bordered className="custom-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Marque</th>
                    <th>Prix</th>
                    <th>Contenance</th>
                    <th>Prix Ajusté</th>
                    <th>Taux de Marge (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedByArticle).map((articleKey) => {
                    const articles = groupedByArticle[articleKey];
                    const rapportA = articles[0]; // Supposons que l'article A est le premier

                    // Utilisez la contenance de l'article B pour le calcul
                    return (
                      <React.Fragment key={articleKey}>
                        {articles.map((rapport, index) => {
                          const prixAjusteArticleA = calculateAdjustedPrice(
                            rapportA.prix,
                            rapportA.contenance,
                            rapport.contenance
                          );
                          return (
                            <tr key={`${rapport.idLigne}-${index}`}>
                              {index === 0 && (
                                <td rowSpan={articles.length}>
                                  {rapport.article}
                                </td>
                              )}
                              <td>{rapport.marque}</td>
                              <td>{rapport.prix}</td>
                              <td>{rapport.contenance}</td>
                              <td>{prixAjusteArticleA.toFixed(2)} </td>{" "}
                              {/* Prix ajusté */}
                              <td>
                                {calculateMarginRate(
                                  rapport.prix,
                                  prixAjusteArticleA
                                ).toFixed(2)}{" "}
                                %
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          );
        })
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "15px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    color: "#333",
    marginBottom: "10px",
    textAlign: "center",
  },
  formContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginRight: "15px",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    width: "195px",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#d6eaf8",
    fontSize: "16px",
    marginLeft: "10px",
    height: "40px",
    marginTop: "30px",
    alignItems: "center",
  },
  loading: {
    fontSize: "16px",
    color: "#007bff",
    textAlign: "center",
  },
  error: {
    fontSize: "16px",
    color: "red",
    textAlign: "center",
  },
  empty: {
    fontSize: "16px",
    color: "#333",
    textAlign: "center",
  },
  tableContainer: {
    marginBottom: "20px",
  },
  "custom-heading": {
    fontSize: "18px",
    marginBottom: "10px",
  },
  "custom-table": {
    width: "100%",
  },
};

export default RapportComponent;
