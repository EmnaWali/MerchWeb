import React, { useState } from "react";
import { Button, Form, Image, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Remplacement de useHistory par useNavigate
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const logo = require("./logo.png");

export default function Login() {
  const [click, setClick] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Utilisation du hook useNavigate

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}Login`,
        null,
        {
          params: {
            login: username,
            password: password,
          },
        }
      );

      if (response.status === 200) {
        navigate("/ReactBigCalendar"); // Navigation vers la page Calendar
      }
    } catch (error) {
      alert(
        "Login Failed: " +
          (error.response?.data?.message || "An error occurred")
      );
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center py-5">
      <Image
        src={logo}
        style={{ height: "160px", width: "170px", marginBottom: "80px" }}
        fluid
      />

      <Form className="w-100" style={{ maxWidth: "400px" }}>
        <Form.Group controlId="formUsername" className="mb-3">
          <Form.Control
            type="text"
            placeholder="EMAIL"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Control
            type="password"
            placeholder="MOT DE PASSE"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Row className="mb-3 align-items-center">
          <Col>
            <Form.Check
              type="switch"
              id="custom-switch"
              label="Remember Me"
              checked={click}
              onChange={() => setClick(!click)}
            />
          </Col>
        </Row>

        <Button variant="primary" onClick={handleLogin} className="w-100">
          LOGIN
        </Button>
      </Form>
    </Container>
  );
}
