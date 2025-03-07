import React, { useEffect, useState } from "react";
import styles from "./LoginClient.module.css";
import { useHistory, useParams } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import NavbarTwo from "../../Components/NavbarTwo/NavbarTwo";
import { useDispatch, useSelector } from "react-redux";

import { auth, handleSignInWithGoogle } from "../../firebase-config";

import { signInWithEmailAndPassword } from "firebase/auth";

import Swal from "sweetalert2";
import AuthProvider from "../../Components/AuthProvider/AuthProvider";
import Loading from "../Loading/Loading";
import { validate } from "./validation";

const LoginClient = () => {
  const history = useHistory();
  const { id } = useParams();
  const [botomText, setBotomText] = useState("Iniciar Sesion");
  // depende el estado se renderiza algo, no funcionando actualmente
  const [state, setCurrentState] = useState(null);
  //enviar al auth de firebase para que verifique
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  // ir seteando el form
  const changeHandler = (event) => {
    const property = event.target.name;
    const value = event.target.value;

    setForm({ ...form, [property]: value });
  };
  const blurvalidation = (event) => {
    const property = event.target.name;
    const value = event.target.value;
    setErrors(
      validate({
        ...form,
        [property]: value,
      })
    );
  };
function mostrarCargando() {
    setBotomText("Cargando...");
    setTimeout(function () {
      setBotomText("Iniciar Sesion");
    }, 2000);
  }

  const submitHandler = async (event) => {
    event.preventDefault();
    mostrarCargando()
    // loguearse con mail
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
    } catch (error) {
      error.message.includes("password")
        ? setErrors(
            validate(
              {
                ...form,
              },
              "password"
            )
          )
        : setErrors(
            validate(
              {
                ...form,
              },
              "email"
            )
          );
    }
  };

  const handleUserLoggedIn = async (id) => {
    // si se logueo correctamente que le mande a su calendario
    const user = auth.currentUser;
    if (user) {
      // El usuario ya ha iniciado sesión, redirigir al usuario a la página de destino
      history.push(`/form/${id}`);
      return;
    }
    await Swal.fire({
      title: "Logueo exitoso",
      icon: "success",
      text: "El usuario ha sido logueado correctamente.",
      confirmButtonText: "Aceptar",
    }).then(() => {
      history.push(`/form/${id}`);
    });
  };
  const handleUserNotLoggedIn = () => {
    // si no esta logueado que le muestre el form
    setCurrentState(1);
  };
  const handleUserNotRegistered = async (id) => {
    const user = auth.currentUser;
    if (user) {
      // El usuario ya ha iniciado sesión, redirigir al usuario a la página de destino
      history.push(`/form/${id}`);
      return;
    }
    await Swal.fire({
      title: "Logueo exitoso",
      icon: "success",
      text: "El usuario ha sido logueado correctamente.",
      confirmButtonText: "Aceptar",
    }).then(() => {
      // redirigir cuando acepta popup
      history.push(`/form/${id}`);
    });
  };

  if (state === 1) {
    return (
      <>
        <NavbarTwo />
        <div className={styles.container2}>
          <div className={styles.img2}></div>
          <div>
            <form className={styles.form2} onSubmit={submitHandler}>
              <h2 className={styles.tittle2}>Bienvenido a Flex agenda!</h2>
              <label className={styles.email}>Email:</label>
              <input
                type="text"
                value={form.email}
                onChange={changeHandler}
                onBlur={blurvalidation}
                name="email"
                className={styles.email_input}
              />
              {/* <p className={styles.error_email}>Email ingresado no valido</p> */}
              {errors.email && (
                <p className={styles.error_email}>{errors.email}</p>
              )}
              <label className={styles.password}>Contraseña:</label>
              <input
                type="password"
                value={form.password}
                onChange={changeHandler}
                name="password"
                className={styles.password_input}
              />
              {errors.password && (
                <p className={styles.error_password}>{errors.password}</p>
              )}
              <button className={styles.login}>{botomText}</button>
              <h3 className={styles.o}>o</h3>
              <div className={styles.register}>
                <div className={styles.register_items}>
                  <p className={styles.text}>No tienes una cuenta?</p>
                  <a href={`/formClient/${id}`} className={styles.signUp}>
                    Registrarse
                  </a>
                </div>
              </div>
              <button
                className={styles.google}
                onClick={handleSignInWithGoogle}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google logo"
                />
                Continuar con google
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // todas las validaciones se manejan aca
  return (
    <AuthProvider
      id={id}
      onUserLoggedIn={handleUserLoggedIn}
      onUserNotLoggedIn={handleUserNotLoggedIn}
      onUserNotRegistered={handleUserNotRegistered}
    >
      <NavbarTwo></NavbarTwo>
      <Loading />
      <Footer></Footer>
    </AuthProvider>
  );
};

export default LoginClient;
