"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaAngleDown, FaAngleUp, FaHeart, FaHome, FaMapMarkerAlt, FaSignOutAlt
} from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const [provincias, setProvincias] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [refugioSeleccionado, setRefugioSeleccionado] = useState("");
  const [user, setUser] = useState(null);
  const [historiasDeExito, setHistoriasDeExito] = useState([]);
  const [mostrarHistorias, setMostrarHistorias] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProvincias = async () => {
      const { data, error } = await supabase
        .from("refugios")
        .select("provincia")
        .order("provincia", { ascending: true });
      if (!error && data) {
        const unicas = [...new Set(data.map(r => r.provincia).filter(Boolean))];
        setProvincias(unicas);
      }
    };
    fetchProvincias();
  }, []);

  useEffect(() => {
    if (!provinciaSeleccionada) {
      setRefugios([]);
      return;
    }
    const fetchRefugios = async () => {
      const { data, error } = await supabase
        .from("refugios")
        .select("id, name")
        .eq("provincia", provinciaSeleccionada)
        .order("name", { ascending: true });
      if (!error && data) setRefugios(data);
    };
    fetchRefugios();
  }, [provinciaSeleccionada]);

  useEffect(() => {
    const fetchAnimales = async () => {
      const query = supabase
        .from("animales")
        .select("*")
        .order("name", { ascending: true });

      if (refugioSeleccionado) {
        query.eq("refugio_id", refugioSeleccionado);
      }

      const { data, error } = await query;
      if (!error && data) {
        setAnimales(data);
      } else {
        console.error("Error al obtener animales:", error);
      }
    };
    fetchAnimales();
  }, [refugioSeleccionado]);

  useEffect(() => {
    const fetchHistoriasDeExito = async () => {
      const { data, error } = await supabase
        .from("historias_de_exito")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setHistoriasDeExito(data);
    };
    fetchHistoriasDeExito();
  }, []);

  const toggleHistorias = () => setMostrarHistorias(!mostrarHistorias);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-300 flex flex-col items-center py-10">
      <header
        className="w-full font-poppins max-w-5xl bg-center py-22 px-8 rounded-lg shadow-xl mb-18"
        style={{ backgroundImage: "url('/cabecera.png')" }}
      ></header>

      <div className="w-full max-w-3xl flex flex-col items-center gap-6 mb-12">

        {/* Botones Login / Logout */}
        <div className="w-full flex justify-between max-w-3xl mb-6">
          {user ? (
            <>
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition">
                Ir al Dashboard
              </Link>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow transition">
                <FaSignOutAlt className="inline mr-2" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow transition">
                Iniciar sesión
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Selector Provincia / Refugio */}
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full flex flex-col gap-6 mb-6">
          <h2 className="text-3xl font-semibold text-blue-700 text-center font-poppins">Selecciona tu Refugio</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="flex flex-col">
              <label className="font-semibold text-blue-600 mb-1 flex items-center gap-2">
                <FaMapMarkerAlt /> Provincia
              </label>
              <select
                className="border-2 border-blue-200 rounded-lg px-6 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={provinciaSeleccionada}
                onChange={e => {
                  setProvinciaSeleccionada(e.target.value);
                  setRefugioSeleccionado("");
                  setAnimales([]);
                }}
              >
                <option value="">Selecciona Provincia</option>
                {provincias.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-purple-600 mb-1 flex items-center gap-2">
                <FaHome /> Refugio
              </label>
              <select
                className="border-2 border-purple-200 rounded-lg px-6 py-3 text-black focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                value={refugioSeleccionado}
                onChange={e => setRefugioSeleccionado(e.target.value)}
                disabled={!provinciaSeleccionada}
              >
                <option value="">Selecciona Refugio</option>
                {refugios.map(ref => (
                  <option key={ref.id} value={ref.id}>{ref.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Animales Destacados */}
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-semibold text-blue-700 text-center font-poppins">Animales Buscando Hogar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {animales.length > 0 ? animales.map(animal => (
              <div
                key={animal.id}
                onClick={() => router.push(`/animal/${animal.id}`)}
                className="group bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 border border-blue-100 hover:scale-105 hover:shadow-2xl transition-transform duration-200 cursor-pointer relative overflow-hidden"
              >
                <img
                  src={animal.imagen || "/images/default-animal.jpg"}
                  alt={animal.name}
                  className="w-32 h-32 object-cover rounded-full border-4 border-blue-300 shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
                <div className="text-xl font-bold text-blue-700 text-center">{animal.name}</div>
                <div className="text-purple-600 font-semibold text-center">{animal.breed}</div>
                <div className="text-gray-600 text-center line-clamp-2">{animal.descripcion}</div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full
                    ${animal.status === "Disponible" ? "bg-green-200 text-green-800" : ""}
                    ${animal.status === "En espera" ? "bg-yellow-200 text-yellow-800" : ""}
                    ${animal.status === "Adoptado" ? "bg-gray-300 text-gray-800" : ""}
                `}
                >
                  {animal.status}
                </span>
                <span className="absolute top-2 right-2 bg-gradient-to-br from-blue-400 to-purple-400 text-white px-2 py-1 rounded-full text-xs shadow font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                  Más detalles
                </span>
              </div>
            )) : (
              <div className="text-center text-gray-500 mt-6 col-span-full">No hay animales disponibles.</div>
            )}
          </div>
        </div>

        {/* Botón y sección de Historias de Éxito */}
        <button
          onClick={toggleHistorias}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg mt-4 shadow-lg hover:from-blue-600 hover:to-purple-700 transition transform hover:scale-105"
        >
          {mostrarHistorias ? "Ocultar Historias de Éxito" : "Ver Historias de Éxito"}
          {mostrarHistorias ? <FaAngleUp className="inline ml-2" /> : <FaAngleDown className="inline ml-2" />}
        </button>

        <div className={`overflow-hidden transition-all duration-1000 ease-in-out transform ${mostrarHistorias ? "max-h-screen opacity-100 scale-100" : "max-h-0 opacity-0 scale-90"}`}>
          {mostrarHistorias && (
            <div className="bg-white/90 rounded-3xl shadow-xl p-8 w-full max-w-3xl flex flex-col gap-6 border-2 border-blue-200 animate-slide-up mt-4">
              <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3 justify-center drop-shadow-lg">
                <FaHeart /> Historias de Éxito
              </h2>
              <div className="flex flex-col gap-6">
                {historiasDeExito.map(historia => (
                  <div key={historia.id} className="flex gap-6 items-center">
                    <img
                      src={historia.imagen || "/images/default-adopted.jpg"}
                      alt={historia.nombre}
                      className="w-28 h-28 object-cover rounded-full border-4 border-blue-300 shadow-lg"
                    />
                    <div>
                      <p className="text-lg font-semibold">{historia.nombre}</p>
                      <p className="text-sm text-gray-600">{historia.testimonio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
