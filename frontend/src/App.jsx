import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS file for styling

function App() {
  const [persons, setPersons] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const response = await axios.get('/api/person');
      setPersons(response.data);
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  const addPerson = async () => {
    try {
      await axios.post('/api/person', { name, email });
      fetchPersons();
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const deletePerson = async (id) => {
    try {
      await axios.delete(`/api/person/${id}`);
      fetchPersons();
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const updatePerson = async (id, updatedName, updatedEmail) => {
    try {
      await axios.put(`/api/person/${id}`, { name: updatedName, email: updatedEmail });
      fetchPersons();
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Manage Persons</h1>
      <div className="form">
        <input className="input" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="button" onClick={addPerson}>Add Person</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {persons.map(person => (
            <tr key={person.id}>
              <td>{person.name}</td>
              <td>{person.email}</td>
              <td>
                <button className="delete-button" onClick={() => deletePerson(person.id)}>Delete</button>
                <button className="update-button" onClick={() => updatePerson(person.id, prompt('Enter updated name'), prompt('Enter updated email'))}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
