import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import CustomToolbar from "./CustomToolbar";
import "./ReactBigCalendar.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

moment.locale("fr");
const localizer = momentLocalizer(moment);

const Event = ({ event }) => (
  <span className="rbc-event">
    <span className="dot"></span>
    <span>
      {moment(event.start).format("HH:mm")} - {event.client}
      {event.clientCode}
    </span>
  </span>
);

const ReactBigCalendar = ({ events, setEvents, addMission, updateMission }) => {
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

  const [merchandisers, setMerchandisers] = useState([]);
  const [clients, setClients] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchWorkers();
      if (newEvent.worker) {
        await fetchClients(newEvent.worker); // Fetch clients only if workerId is available
      }
    };

    fetchData();
  }, [newEvent.worker]);

  const fetchClients = async (workerId) => {
    console.log(`Fetching clients for worker ID: ${workerId}`);
    try {
      const response = await axios.get(
        `${API_BASE_URL}Merchandiser/GetClientsByMerch/${workerId}`
      );
      console.log("Clients fetched successfully:", response.data);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}Merchandiser/GetMerchandisers`
      );
      setMerchandisers(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des travailleurs:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isEditMode) {
      await updateMission(newEvent);
    } else {
      await addMission(newEvent);
    }
    handleClose();
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
  };

  const handleClientChange = (e) => {
    const selectedClientId = e.target.value;
    const selectedClient = clients.find(
      (client) => client.idClient === parseInt(selectedClientId)
    );

    setNewEvent({
      ...newEvent,
      client: selectedClientId,
      adresse: selectedClient?.adresse || "",
      raisonSocial: selectedClient?.raisonSocial || "",
      gouvernorat: selectedClient?.gouvernorat || "",
    });
  };

  const handleWorkerChange = async (e) => {
    const workerId = e.target.value;
    setNewEvent({
      ...newEvent,
      worker: workerId,
    });

    if (workerId) {
      await fetchClients(workerId); // Pass the workerId here
    }
  };

  const handleUpdateEvent = (event) => {
    setNewEvent({
      id: event.id,
      client: event.client,
      worker: event.worker,
      gouvernorat: event.gouvernorat,
      missionDescription: event.missionDescription,
      date: moment(event.start).format("YYYY-MM-DD"),
      time: moment(event.start).format("HH:mm:ss"),
      raisonSocial: event.raisonSocial,
      adresse: event.adresse,
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  return (
    <Container>
      <Calendar
        localizer={localizer}
        events={events.map((event) => ({
          ...event,
          start: new Date(`${event.date}T${event.time}`),
          end: new Date(`${event.date}T${event.time}`),
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        components={{
          event: (eventProps) => (
            <Event
              key={eventProps.event.id || eventProps.event.start}
              {...eventProps}
            />
          ),
          toolbar: CustomToolbar,
        }}
        onSelectEvent={(event) => handleUpdateEvent(event)}
      />

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Modifier la mission" : "Ajouter une mission"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formWorker">
              <Form.Label>Merchandiseur</Form.Label>
              {isEditMode ? (
                <Form.Control
                  type="text"
                  value={newEvent.worker || ""}
                  readOnly
                />
              ) : (
                <Form.Control
                  as="select"
                  value={newEvent.worker || ""}
                  onChange={handleWorkerChange}
                >
                  <option value="">Sélectionnez un Merchandiseur</option>
                  {merchandisers.map((worker) => (
                    <option key={worker.user_id} value={worker.user_id}>
                      {worker.name}
                    </option>
                  ))}
                </Form.Control>
              )}
            </Form.Group>

            <Form.Group controlId="formClient">
              <Form.Label>Client</Form.Label>
              <Form.Control
                as="select"
                value={newEvent.client}
                onChange={handleClientChange}
              >
                <option value="">Sélectionnez un client</option>
                {clients.map((client) => (
                  <option key={client.idClient} value={client.idClient}>
                    {client.clientCode}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formRaisonSocial">
              <Form.Label>Raison Sociale</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.raisonSocial}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId="formAdresse">
              <Form.Label>Adresse</Form.Label>
              <Form.Control type="text" value={newEvent.adresse} readOnly />
            </Form.Group>

            <Form.Group controlId="formGouvernorat">
              <Form.Label>Gouvernorat</Form.Label>
              <Form.Control type="text" value={newEvent.gouvernorat} readOnly />
            </Form.Group>

            <Form.Group controlId="formMissionDescription">
              <Form.Label>Description de la mission</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.missionDescription}
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
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formTime">
              <Form.Label>Heure</Form.Label>
              <Form.Control
                type="time"
                value={newEvent.time}
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
    </Container>
  );
};

export default ReactBigCalendar;
