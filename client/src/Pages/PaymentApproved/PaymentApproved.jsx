import React from "react";
import s from "./PaymentApproved.module.css"
import NavbarTwo from "../../Components/NavbarTwo/NavbarTwo";
import { NavLink, useHistory } from "react-router-dom";
import { useParams, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import Cookies from 'universal-cookie';
import axios from "axios";
import AddReview from "../../Components/AddReview/AddReview";
import Swal from "sweetalert2";

const PaymentApproved = () => {


    const search = window.location.search;
    const cookies = new Cookies();
    const send = cookies.get('turnToPost');
    const id = cookies.get('idProfessional')

    const history = useHistory();

    const dispatch = useDispatch();

    const deleteParams = () => {
        if (search) {
            window.location=window.location.origin + window.location.pathname
        }
    }

    const postHandler = () => {
        axios
          .post("https://backend-pf-production-1672.up.railway.app/turn", send)
          .then((res) => {
            if (res.status === 200) {
              Swal.fire({
                title: "Turno tomado",
                icon: "success",
                text: "Se ha tomado el turno exitosamente.",
                confirmButtonText: "Aceptar",
              });
            } else {
              alert("Algo salio mal");
            }
          })
          .catch((err) => alert("Algo salio mal")); 
      };

    useEffect(() => {
        {postHandler()}
    },[])

    const handleNavLinkClick = () => {
        history.push(`/profTT/${id}`);
    }

    return(
        <div>
            <NavbarTwo/>
            {deleteParams()}
            <div className={s.pageContainer}>
                <div className={s.succesContainer}>
                    <div className={s.textCont}>
                        <h2 className={s.text}>Pago realizado correctamente</h2>
                        <iconify-icon icon="clarity:success-standard-solid" width="30" height="30"></iconify-icon>
                    </div>
                    <h3>Tu turno ya está registrado</h3>
                </div>
                <botton className={s.link} to="#" onClick={handleNavLinkClick}>Tomar otro turno</botton> 
                <div>
                    <AddReview idProf={id}/>
                </div>
                <div className={s.quejaContainer}>
                    <h3 className={s.queja}>Por consultas o quejas contactarse por mail con flexagenda1@gmail.com</h3>
                </div>

            </div>
            
        </div>
    )
}

export default PaymentApproved;
