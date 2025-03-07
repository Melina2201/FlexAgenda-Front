/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import NavbarTwo from "../../Components/NavbarTwo/NavbarTwo";
import styles from "./Form.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  getClients,
  getServices,
  getProfessionals,
  getTurns,
} from "../../Redux/Actions";
import { useHistory, useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";
import { auth, userExists } from "../../firebase-config";

const Form = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const [error, setError] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userDb, setUserDb] = useState(null);
  const [botonTexto, setBotonTexto] = useState("Confirmar turno");
  const [horarioDisponible, setHorarioDisponible] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user.displayName) setCurrentUser(user.email);
      const newUser = await userExists(user.uid);

      setUserDb(newUser.email);
    });
  }, []);
  console.log(currentUser);
  console.log(userDb);

  useEffect(() => {
    dispatch(getClients());
    dispatch(getProfessionals());
    dispatch(getServices());
    dispatch(getTurns());
  }, [dispatch]);

  const turns = useSelector((state) => state.turns);
  const filteredTurns = turns.filter((turn) => turn.professionalID === id);

  const allClients = useSelector((state) => state.allClients);
  const allProfessionals = useSelector((state) => state.allProfessionals);
  const serv = useSelector((state) => state.allServices);

  const servProfs = serv.filter((service) => service.ProfessionalId === id);

  const clienteLog = allClients.find(
    (client) =>
      client.email === (userDb ? userDb : currentUser) /* || currentUser  */
  );
  console.log(turns);

  const findProfesional = allProfessionals.find((prof) => id === prof.id);

  const [form, setForm] = useState({
    date: "",
    hour: "",
    ProfessionalId: "",
    ClientId: "",
    ServiceId: "",
  });

  function mostrarCargando() {
    setBotonTexto("Cargando...");
    setTimeout(function () {
      setBotonTexto("Confirmar turno");
    }, 2000);
  }

  const turnosXdia = form.date
    ? filteredTurns.filter((t) => t.date === form.date)
    : console.log("hay turnos");
  //  console.log(turnosXdia);

  const horasXdia = turnosXdia
    ? turnosXdia.map((t) => t.hour)
    : console.log("hay hora");
  // console.log(horasXdia);

  useEffect(() => {
    if (clienteLog && allProfessionals.length) {
      setForm({
        ...form,
        ClientId: clienteLog.id,
        ProfessionalId: findProfesional.id,
      });
    }
  }, [allClients, allProfessionals, clienteLog]);

  function validate(form) {
    let error = {};

    if (!form.date) {
      error.date = "Ingresa el día del turno";
    }

    if (!form.hour || form.hour == "") {
      error.hour = "Ingresa la hora del turno";
    }

    if (!form.ServiceId[0] || form.ServiceId == "") {
      error.ServiceId = "Se requiere un servicio";
    }

    if (
      !form.date ||
      !form.hour ||
      !form.ServiceId[0] ||
      form.ServiceId == ""
    ) {
      error.button = "Complete todos los campos";
    }
    return error;
  }

  useEffect(() => {
    const takenHours = []; // list of already taken hours
    // You should get the list of taken hours from your backend
    // or from a local storage.

    const availableTimes = getAvailableTimes(takenHours);
    setAvailableTimes(availableTimes);
  }, []);

  const changeHandler = (event) => {
    const property = event.target.name;
    const value = event.target.value;

    const selectedDate = new Date(event.target.value);
    if (selectedDate.getDay() === 6 || selectedDate.getDay() === 5) {
      setError((prevErrors) => ({
        ...prevErrors,
        date: "No hay turnos para este día",
      }));
      setAvailableTimes([]);
    } else {
      setError((prevErrors) => ({
        ...prevErrors,
        date: "",
      }));
      const takenHours = []; // list of already taken hours
      // You should get the list of taken hours from your backend
      // or from a local storage.
      const availableTimes = getAvailableTimes(takenHours);
      setAvailableTimes(availableTimes);
    }

    setForm({ ...form, [property]: value });
    validate({ ...form, [property]: value });
  };

  function getAvailableTimes(takenHours) {
    const startTime = 7; // start time of working hours
    const endTime = 19; // end time of working hours
    const timeSlots = []; // list of available times
    for (let i = startTime; i <= endTime; i++) {
      if (i === startTime || i === endTime) {
        if (i == 7 || i == 8 || i == 9) {
          i = "0" + i;
        }
        timeSlots.push(`${i}:00`);
        
      } else {
        if (i == 7 || i == 8 || i == 9) {
          i = "0" + i;
        }
        timeSlots.push(`${i}:00`);
        
      }
    }
    return timeSlots.filter((time) => !takenHours.includes(time));
  }

  const submitHandler = async (event) => {
    event.preventDefault();
    mostrarCargando()
    if (error.date || error.hour || error.ServiceId || error.button) {
       await Swal.fire({
        title: "ha ocurrido un error",
        icon: "error",
        text: "Debes validar todos los campos.",
        confirmButtonText: "Aceptar",
      });
      return
    }
    if (!form.date || !form.hour || !form.ServiceId[0] || form.ServiceId == ""){
      await Swal.fire({
        title: "ha ocurrido un error",
        icon: "error",
        text: "Debes completar todos los campos.",
        confirmButtonText: "Aceptar",
      });
      return
    }

    const servElegido = serv.filter((ser) => ser.id == form.ServiceId);
    const send = {
      ...form,
      quantity: 1,
      price: servElegido[0].price,
      title: servElegido[0].name,
      turnId: `${servElegido[0].id}${servElegido[0].price}${form.ClientId}${form.ProfessionalId}${form.date}${form.hour}`,
    };

    const cookies = new Cookies();
    cookies.set("turnToPost", form, { path: "/" });
    cookies.set("idProfessional", id, { path: "/" });
    cookies.set("findProfessional", findProfesional, { path: "/" });

    axios
      .post("https://backend-pf-production-1672.up.railway.app/payment", send)
      .then((res) => {
        localStorage.removeItem("form");
        window.location.href = res.data.response.body.init_point;
      })
      .catch((error) => console.log(error));
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

  useEffect(() => {
    const storedForm = JSON.parse(localStorage.getItem("form"));
    if (storedForm) {
      setForm(storedForm);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("form", JSON.stringify(form));
  }, [form]);

  return (
    <div>
      <NavbarTwo />
        <div style={{ display: "flex" ,justifyContent: "center" }}>
<div className={styles.divnuevo}>
      <div className={styles.img}></div> 
      <div className={styles.container}>
        <form onSubmit={submitHandler} className={styles.form}>
          <h1 className={styles.tittle}>AGENDÁ TU TURNO</h1>

          <label className={styles.label}>FECHA:</label>
          <br />
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={changeHandler}
            name="date"
            min={new Date().toISOString().slice(0, 10)}
          />
          <div className={styles.error}>
            {error.date && <span>{error.date}</span>}{" "}
          </div>

          <label className={styles.label}>HORA:</label>
          <br />
          <select
            className={styles.select}
            value={form.hour}
            onChange={changeHandler}
            name="hour"
          >
            <option value="">Seleccione una hora</option>
            {horasXdia &&
              availableTimes.map((time) => (
                <option
                  key={time}
                  value={time}
                  className={horasXdia.includes(time) ? styles.hide : ""}
                >
                  {time}
                </option>
              ))}
          </select>

          <div className={styles.error}>
            {error.hour && <span>{error.hour}</span>}{" "}
          </div>

          <label className={styles.label}>
            PROFESIONAL:
            {findProfesional && (
              <h2 className={styles.nombres}>{findProfesional.name}</h2>
            )}
          </label>
          <label className={styles.label}>
            CLIENTE:
            {clienteLog && (
              <h2 className={styles.nombres}>{clienteLog.name}</h2>
            )}
          </label>

          <label className={styles.label}>SERVICIO:</label>
          <select
            name="ServiceId"
            onChange={handleSelectServ}
            className={styles.select}
            >
           {!form.hour ? "" : 
           <>
          <option value="" className={styles.input}>
                Servicio
          </option>
          {servProfs?.map((element, index) => (
            <option key={index} value={element.id} className={styles.input}>
           {element.name}
         </option>
        ))}
        </>
      }


            <div className={styles.error}>
              {error.ServiceId && <span>{error.ServiceId}</span>}
            </div>
          </select>
          
          <button className={styles.button} type="submit">
           {botonTexto}
          </button>
          <div className={styles.error}>
          {error.button && <span>{error.button}</span>}
            </div>
        </form>
      </div>
      </div>
      </div>
    </div>
  );
};

export default Form;
