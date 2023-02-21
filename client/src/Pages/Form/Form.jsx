/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import NavbarTwo from "../../Components/NavbarTwo/NavbarTwo";

import styles from "./Form.module.css";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { getClients, getServices, getProfessionals } from "../../Redux/Actions";
import { useHistory, useParams } from "react-router-dom";

const Form = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const [error, setError] = useState({});

  useEffect(() => {
    dispatch(getClients());
    dispatch(getProfessionals());
    dispatch(getServices());
  }, [dispatch]);

  const allClients = useSelector((state) => state.allClients);
  const allProfessionals = useSelector((state) => state.allProfessionals);
  const serv = useSelector((state) => state.allServices);

  const servProfs = serv.filter((service) => service.ProfessionalId === id);

  const ultimoCliente = allClients.length
    ? allClients[allClients.length - 1]
    : "";
  const findProfesional = allProfessionals.find((prof) => id === prof.id);

  const [form, setForm] = useState({
    date: "",
    hour: "",
    ProfessionalId: "",
    ClientId: "",
    ServiceId: "",
  });

  useEffect(() => {
    if (allClients.length && allProfessionals.length) {
      setForm({
        ...form,
        ClientId: ultimoCliente.id,
        ProfessionalId: findProfesional.id,
      });
    }
  }, [allClients, allProfessionals]);

  function validate(form) {
    let error = {};

    if (!form.date) {
      error.date = "Date is required";
    }

    if (!form.hour) {
      error.hour = "Hour is required";
    }

    if (!form.ServiceId[0]) {
      error.ServiceId = "Service is required";
    }
    return error;
  }

  const changeHandler = (event) => {
    const property = event.target.name;
    const value = event.target.value;

    setForm({ ...form, [property]: value });
    validate({ ...form, [property]: value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    axios
      .post("https://backend-pf-production-1672.up.railway.app/turn", form)
      .then((res) => {
        alert("Turn taken correctly");
        history.push(`/profTT/${findProfesional.id}`);
      })
      .catch((err) => alert("Algo salio mal"));
  };

  function handleSelectServ(event) {
    const selected = event.target.value;
    if (
      event.target.value !== "ServiceId" &&
      !form.ServiceId.includes(event.target.value)
    )
      setForm({
        ...form,
        ServiceId: selected,
      });
    setError(
      validate({
        ...form,
        ServiceId: selected,
      })
    );
  }

  return (
    <div>
      <NavbarTwo />

      <div className={styles.container}>
        <form onSubmit={submitHandler} className={styles.form}>
          <h1 className={styles.tittle}>Schedule your turn</h1>

          <label className={styles.label}>DATE:</label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={changeHandler}
            name="date"
          />
          <div className={styles.error}>
            {error.date && <span>{error.date}</span>}{" "}
          </div>

          <label className={styles.label}>HOUR:</label>
          <input
            className={styles.input}
            type="time"
            value={form.hour}
            onChange={changeHandler}
            name="hour"
          />
          <div className={styles.error}>
            {error.hour && <span>{error.hour}</span>}{" "}
          </div>

          <label className={styles.label}>
            PROFESSIONAL:
            <h2>{findProfesional.name}</h2>
          </label>
          <label className={styles.label}>
            CLIENTE:
            <h2>{ultimoCliente.name}</h2>
          </label>

          <label className={styles.label}>SERVICE:</label>
          <select
            name="ServiceId"
            onChange={handleSelectServ}
            className={styles.input}
          >
            <option value="ServiceId">Service</option>
            {servProfs?.map((element, index) => (
              <option key={index} value={element.id}>
                {element.name}
              </option>
            ))}
            <div className={styles.error}>
              {error.ServiceId && <span>{error.ServiceId}</span>}
            </div>
          </select>
          <button className={styles.button} type="submit">
            TAKE TURN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
