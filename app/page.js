"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCat, FaDog, FaHome, FaMapMarkerAlt } from "react-icons/fa";

export default function HomePage() {
  const [provincias, setProvincias] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [refugioSeleccionado, setRefugioSeleccionado] = useState("");
  const [user, setUser] = useState(null);

  // Comprobar usuario logueado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
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
    if (!refugioSeleccionado) {
      setAnimales([]);
      return;
    }
    const fetchAnimales = async () => {
      const { data, error } = await supabase
        .from("animales")
        .select("*")
        .eq("refugio_id", refugioSeleccionado)
        .order("name", { ascending: true });
      if (!error && data) setAnimales(data);
    };
    fetchAnimales();
  }, [refugioSeleccionado]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center py-10 animate-fade-in">
      <div className="w-full flex justify-end mb-4 max-w-3xl">
        {user ? (
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition"
          >
            Ir al Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow transition"
          >
            Registrarse / Iniciar sesión
          </Link>
        )}
      </div>
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-3xl flex flex-col gap-6 border-2 border-blue-200 animate-slide-up">
        <h1 className="text-4xl font-extrabold text-blue-700 flex items-center gap-3 justify-center drop-shadow-lg">
          <FaHome /> Encuentra tu refugio
        </h1>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <div className="flex flex-col">
            <label className="font-semibold text-blue-600 mb-1 flex items-center gap-2">
              <FaMapMarkerAlt /> Provincia
            </label>
            <select
              className="border-2 border-blue-200 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={provinciaSeleccionada}
              onChange={e => {
                setProvinciaSeleccionada(e.target.value);
                setRefugioSeleccionado("");
                setAnimales([]);
              }}
            >
              <option value="">Selecciona provincia</option>
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
              className="border-2 border-purple-200 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              value={refugioSeleccionado}
              onChange={e => setRefugioSeleccionado(e.target.value)}
              disabled={!provinciaSeleccionada}
            >
              <option value="">Selecciona refugio</option>
              {refugios.map(ref => (
                <option key={ref.id} value={ref.id}>{ref.name}</option>
              ))}
            </select>
          </div>
        </div>
        {animales.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-pink-600 mt-6 mb-4 text-center">Animales disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {animales.map(animal => (
                <Link
                  key={animal.id}
                  href={`/animal/${animal.id}`}
                  className="group bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-3 border border-blue-100 hover:scale-105 hover:shadow-2xl transition-transform duration-200 cursor-pointer relative overflow-hidden"
                >
                  <div className="relative mb-2">
                    {animal.imagen ? (
                      <img
                        src={animal.imagen}
                        alt={animal.name}
                        className="w-28 h-28 object-cover rounded-full border-4 border-blue-300 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-purple-200 border-4 border-blue-300 shadow-lg text-4xl text-white">
                        {animal.species?.toLowerCase() === "perro" ? <FaDog /> : <FaCat />}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 bg-white/80 rounded-full px-2 py-1 text-blue-700 font-bold shadow text-xs flex items-center gap-1">
                      {animal.species?.toLowerCase() === "perro" ? <FaDog /> : <FaCat />} {animal.species}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-blue-700 text-center">{animal.name}</div>
                  <div className="text-purple-600 font-semibold text-center">{animal.breed}</div>
                  <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-700">
                    <span className="bg-blue-100 rounded px-2 py-1"><b>Edad:</b> {animal.edad}</span>
                    <span className="bg-pink-100 rounded px-2 py-1"><b>Sexo:</b> {animal.sexo}</span>
                  </div>
                  <div className="text-gray-600 text-center line-clamp-2">{animal.descripcion}</div>
                  <span className="absolute top-2 right-2 bg-gradient-to-br from-blue-400 to-purple-400 text-white px-2 py-1 rounded-full text-xs shadow font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                    Ficha
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {refugioSeleccionado && animales.length === 0 && (
          <div className="text-center text-gray-500 mt-6">
            No hay animales registrados en este refugio.
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease;
        }
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(.4,2,.6,1) 0.1s both;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}