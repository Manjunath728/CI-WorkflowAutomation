// App.js
import  { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faCheck,
  faTimes,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const [persons, setPersons] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const response = await axios.get("/api/person");
      setPersons(response.data);
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };

  const addPerson = async () => {
    if (!name || !email) {
      // If either name or email is empty, show a toast notification
      toast.error('Add both name and Email', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        });
      return;
    }
    try {
      await axios.post("/api/person", { name, email });
      fetchPersons();
      setName("");
      setEmail("");
      setShowDialog(false); // Hide the dialog after adding person
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };

  const deletePerson = async (id) => {
    try {
      await axios.delete(`/api/person/${id}`);
      fetchPersons();
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  const toggleUpdate = (id, currentName, currentEmail) => {
    setUpdatingId(id);
    setUpdatedName(currentName);
    setUpdatedEmail(currentEmail);
  };

  const updatePerson = async (id) => {
    if (!updatedName || !updatedEmail) {
      // If either name or email is empty, show a toast notification
      toast.error('Add both name and Email', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        });
      return;
    }
    try {
      await axios.put(`/api/person/${id}`, {
        name: updatedName,
        email: updatedEmail,
      });
      fetchPersons();
      setUpdatingId(null);
    } catch (error) {
      console.error("Error updating person:", error);
    }
  };

  return (
    <div className="container">
    <ToastContainer />
      <h1 className="heading" style={{color:"red"}} >People Manager Microservice 🧑‍🤝‍🧑</h1>
     

      <div className="cards-container">
      
        {persons.map((person) => (
          <div className="card" key={person.id}>
            <div className="card-body">
              {updatingId === person.id ? (
                <input
                  className="input"
                  type="text"
                  placeholder="Updated Name"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                />
              ) : (
                <h3>{person.name}</h3>
              )}
              {updatingId === person.id ? (
                <input
                  className="input"
                  type="email"
                  placeholder="Updated Email"
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                />
              ) : (
                <p>{person.email}</p>
              )}
            </div>
            <div className="card-footer">
              {updatingId === person.id ? (
                <div className="action-buttons">
                  <button
                    className="ok-button"
                    onClick={() => {
                      updatePerson(person.id);
                      setUpdatingId(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setUpdatingId(null)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="delete-button"
                    onClick={() => deletePerson(person.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button
                    className="update-button"
                    onClick={() =>
                      toggleUpdate(person.id, person.name, person.email)
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </>
              )}
              
            </div>
           
          </div>
        ))}
        {showDialog && (
          <div className="overlay">
            <div className="card dialog">
              <div className="card-body">
                <input
                  className="input"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="card-footer">
                <button className="button" onClick={addPerson}>
                  Add Person
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        className="floating-button"
        onClick={() => setShowDialog(true)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
}

export default App;
