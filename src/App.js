// App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReactBigCalendar from './ReactBigCalendar';
import MissionList from './MissionList';
import RapportComponent from './RapportPrix';
import RapportQte from './RapportQte';
import RapportFacing from './RapportFacing';
import moment from 'moment';
import Login from './Login';
import './styles.css';
import Layout from './Layout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Utilisation de la variable d'environnement

const App = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(process.env);
      const response = await fetch(`${API_BASE_URL}Mission/GetMissions`);
      console.log("API Base URL:", API_BASE_URL);
      
      

      if (response.ok) {
        const text = await response.text();
        const data = JSON.parse(text);
        const formattedData = data.map(mission => ({
          id: mission.missionId || null,
          client: mission.clientCode || "",
          gouvernorat: mission.gouvernorat || "",
          missionDescription: mission.missionDescription || "",
          worker: mission.userName || "",
          date: moment(mission.missionDate).format("YYYY-MM-DD"),
          time: moment(mission.missionTime, "HH:mm:ss").format("HH:mm:ss"),
          raisonSocial: mission.raisonSocial || "",
          adresse: mission.adresse || ""
        })).filter(Boolean);
        setEvents(formattedData);
        localStorage.setItem("missions", JSON.stringify(formattedData));
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des missions", error);
      alert(`Erreur lors de la récupération des missions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleApiCall = async (url, method, formData, successCallback) => {
    setIsLoading(true);
    try {
      const response = await fetch(url, { method, body: formData });
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.errors?.client?.[0] || "Erreur inconnue";
        throw new Error(`Erreur ${response.status}: ${errorMessage}`);
      }
      const result = await response.json();
      successCallback(result);
    } catch (error) {
      console.error("Erreur lors de l'appel API", error);
      alert(`Erreur lors de l'appel API: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addMission = async (newEvent) => {
    const formData = new FormData();
    formData.append("client", newEvent.client);
    formData.append("missionDescription", newEvent.missionDescription);
    formData.append("userId", newEvent.worker);
    formData.append("missionDate", newEvent.date);
    formData.append("missionTime", newEvent.time);
    handleApiCall(
      `${API_BASE_URL}Mission/AddMission`,
      "POST",
      formData,
      newMission => setEvents(prevEvents => [...prevEvents, newMission])
    );
  };

  const updateMission = async (updatedEvent) => {
    const formData = new FormData();
    formData.append("client", updatedEvent.client);
    formData.append("missionDescription", updatedEvent.missionDescription);
    formData.append("missionDate", updatedEvent.date);
    formData.append("missionTime", updatedEvent.time);
    handleApiCall(
      `${API_BASE_URL}Mission/UpdateMission?missionId=${updatedEvent.id}`,
      "PUT",
      formData,
      updatedMission => setEvents(prevEvents =>
        prevEvents.map(event => event.id === updatedEvent.id ? updatedMission : event)
      )
    );
  };

  const deleteMission = async (missionId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}Mission/DeleteMission?missionId=${missionId}`, { method: "DELETE" });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      setEvents(prevEvents => prevEvents.filter(event => event.id !== missionId));
    } catch (error) {
      console.error("Erreur lors de la suppression de la mission", error);
      alert(`Erreur lors de la suppression de la mission: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/ReactBigCalendar"
            element={<ReactBigCalendar
              events={events}
              setEvents={setEvents}
              addMission={addMission}
              updateMission={updateMission}
              deleteMission={deleteMission}
              isLoading={isLoading}
            />}
          />
          <Route
            path="/missions"
            element={<MissionList
              events={events}
              setEvents={setEvents}
              addMission={addMission}
              updateMission={updateMission}
              deleteMission={deleteMission}
              isLoading={isLoading}
            />}
          />
          <Route path="/RapportPrix" element={<RapportComponent />} />
          <Route path="/RapportQte" element={<RapportQte />} />
          <Route path="/RapportFacing" element={<RapportFacing />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
