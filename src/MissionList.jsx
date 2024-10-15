import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import moment from "moment";
import axios from "axios";
import "./styles.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MissionList = ({ events, addMission, updateMission, deleteMission }) => {
  const [newEvent, setNewEvent] = useState({
    id: null,
    client: "",
    worker: "",
    gouvernorat: "",
    missionDescription: "",
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("HH:mm:ss"),
    raisonSocial: "",
    adresse: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState(null);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);

  const fetchClients = useCallback(async (workerId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}Merchandiser/GetClientsByMerch/${workerId}`
      );
      if (response.data && response.data.length > 0) {
        setClients(response.data);
      } else {
        console.warn("Aucun client trouvé pour ce worker");
      }
    } catch (error) {
      handleError(error);
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}Merchandiser/GetMerchandisers`
      );
      setWorkers(response.data);
    } catch (error) {
      handleError(error);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleError = (error) => {
    if (error.response) {
      console.error("Erreur:", error.response.data);
      if (error.response.data.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          console.error(`Erreur dans le champ ${key}:`, value);
        });
      }
    } else {
      console.error("Erreur réseau ou serveur:", error);
    }
  };

  const handleEdit = (event) => {
    setNewEvent({
      id: event.id,
      client: event.client,
      worker: event.worker,
      gouvernorat: event.gouvernorat,
      missionDescription: event.missionDescription,
      date: event.date,
      time: event.time,
      raisonSocial: event.raisonSocial,
      adresse: event.adresse,
    });
    setIsEditMode(true);
    setShowModal(true);
    if (event.worker) {
      fetchClients(event.worker); // Charger les clients pour le worker actuel
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!newEvent.worker) {
      alert("Veuillez sélectionner un worker.");
      return;
    }

    // Vous pouvez ajouter d'autres vérifications ici, par exemple :
    if (!newEvent.client) {
      alert("Veuillez sélectionner un client.");
      return;
    }

    try {
      if (isEditMode) {
        await updateMission(newEvent);
      } else {
        await addMission(newEvent);
      }
      handleClose();
    } catch (error) {
      handleError(error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setNewEvent({
      id: null,
      client: "",
      worker: "",
      gouvernorat: "",
      missionDescription: "",
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm:ss"),
      raisonSocial: "",
      adresse: "",
    });
    setIsEditMode(false);
    setClients([]);
  };

  const handleClientChange = (e) => {
    const selectedClientId = e.target.value;
    const selectedClient = clients.find(
      (client) => client.idClient === parseInt(selectedClientId)
    );

    if (selectedClient) {
      setNewEvent({
        ...newEvent,
        client: selectedClientId,
        adresse: selectedClient.adresse || "",
        raisonSocial: selectedClient.raisonSocial || "",
        gouvernorat: selectedClient.gouvernorat || "",
      });
    } else {
      console.error("Client non trouvé.");
    }
  };

  const handleWorkerChange = (e) => {
    const selectedWorkerId = e.target.value;
    setNewEvent({
      ...newEvent,
      worker: selectedWorkerId,
    });
    fetchClients(selectedWorkerId);
  };

  const handleDelete = (id) => {
    setMissionToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (missionToDelete) {
      deleteMission(missionToDelete);
      setMissionToDelete(null);
      setShowConfirmModal(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Ajouter une mission
        </Button>
      </div>
      <Table striped bordered hover className="custom-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Raison Sociale</th>
            <th>Adresse</th>
            <th>Gouvernorat</th>
            <th>Mission</th>
            <th>Marchandiseur</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                Aucune mission disponible
              </td>
            </tr>
          ) : (
            events.map((event, index) => (
              <tr key={event.id || `fallback-key-${index}`}>
                <td>{event.client || "N/A"}</td>
                <td>{event.raisonSocial}</td>
                <td>{event.adresse}</td>
                <td>{event.gouvernorat}</td>
                <td>{event.missionDescription}</td>
                <td>{event.worker}</td>
                <td>{event.date}</td>
                <td>{event.time}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => handleEdit(event)}
                    className="me-2"
                  >
                    <i className="bi bi-pencil" style={{ color: "white" }}></i>
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => handleDelete(event.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose} className="custom-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            {isEditMode ? "Modifier la mission" : "Ajouter une mission"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formWorker">
              <Form.Label>Merchandiseur</Form.Label>
              <Form.Control
                as="select"
                value={newEvent.worker || ""} // Utilise l'ID sélectionné
                onChange={handleWorkerChange}
              >
                <option value="">Sélectionnez un worker</option>
                {workers.map((worker) => (
                  <option key={worker.user_id} value={worker.user_id}>
                    {worker.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formClient">
              <Form.Label>Client</Form.Label>
              <Form.Control
                as="select"
                value={newEvent.client || ""} // Assurez-vous que client est bien peuplé
                onChange={handleClientChange}
              >
                <option value="">Sélectionnez un client</option>
                {clients.map((client) => (
                  <option key={client.idClient} value={client.idClient}>
                    {client.raisonSocial + " " + client.adresse}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formRaisonSocial">
              <Form.Label>Raison Social</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.raisonSocial || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId="formAdresse">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.adresse || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId="formGouvernorat">
              <Form.Label>Gouvernorat</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.gouvernorat || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId="formMissionDescription">
              <Form.Label>Description de la mission</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.missionDescription || ""}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    missionDescription: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={newEvent.date || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formTime">
              <Form.Label>Heure</Form.Label>
              <Form.Control
                type="time"
                value={newEvent.time || ""}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {isEditMode ? "Modifier" : "Ajouter"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cette mission ?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MissionList;
