"use client";
import Link from "next/link";
import {
    FaArrowLeft,
    FaDog,
    FaHome,
    FaListUl,
    FaPlusCircle,
} from "react-icons/fa";

export default function SidebarFichaNuevo() {
    return (
        <aside className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-blue-200 p-6 w-full max-w-xs h-fit animate-slide-up">
            <div className="flex items-center gap-2 text-3xl text-yellow-600 mb-4">
                <FaDog />
                <FaPlusCircle />
            </div>
            <h2 className="text-xl font-bold text-blue-700 mb-2">Nuevo animal</h2>
            <p className="text-gray-500 text-sm mb-4">
                Añade un nuevo animal al refugio completando el formulario.
            </p>

            <nav className="flex flex-col gap-3 text-sm">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <FaHome className="text-blue-400" />
                    Ir al panel
                </Link>
                <Link
                    href="/dashboard/animales"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <FaListUl className="text-purple-400" />
                    Ver listado
                </Link>
                <Link
                    href="/dashboard/animales/nuevo"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <FaPlusCircle className="text-pink-400" />
                    Añadir otro animal
                </Link>
                <Link
                    href="/dashboard/animales"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <FaArrowLeft className="text-gray-400" />
                    Volver
                </Link>
            </nav>
        </aside>
    );
}
