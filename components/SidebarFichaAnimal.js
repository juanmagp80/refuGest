"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaEdit,
    FaExchangeAlt,
    FaFileExport,
    FaGlobe,
    FaHandsHelping,
    FaHeartbeat,
    FaPhotoVideo,
    FaShareAlt,
    FaStickyNote,
    FaTrashAlt,
} from "react-icons/fa";

const links = [
    { href: "editar", label: "Editar ficha", icon: <FaEdit /> },
    { href: "movimientos", label: "Movimientos", icon: <FaExchangeAlt /> },
    { href: "fotos", label: "Fotos y vídeos", icon: <FaPhotoVideo /> },
    { href: "salud", label: "Salud", icon: <FaHeartbeat /> },
    { href: "apadrinamientos", label: "Apadrinamientos", icon: <FaHandsHelping /> },
    { href: "notas", label: "Notas", icon: <FaStickyNote /> },
];

const actions = [
    { href: "exportar", label: "Exportar ficha", icon: <FaFileExport /> },
    { href: "web", label: "Ver en la web", icon: <FaGlobe /> },
    { href: "compartir", label: "Compartir ficha", icon: <FaShareAlt /> },
];

export default function SidebarFichaAnimal({ id }) {
    const pathname = usePathname();

    return (
        <aside className="bg-white rounded-2xl shadow-md border w-full sm:w-64 p-4 space-y-4 text-sm text-gray-800">
            <div className="space-y-2">
                {links.map(({ href, label, icon }) => (
                    <NavItem
                        key={href}
                        href={`/dashboard/animales/${id}/${href}`}
                        label={label}
                        icon={icon}
                        active={pathname.includes(`/${href}`)}
                    />
                ))}
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="space-y-2">
                {actions.map(({ href, label, icon }) => (
                    <NavItem
                        key={href}
                        href={`/dashboard/animales/${id}/${href}`}
                        label={label}
                        icon={icon}
                    />
                ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
                <NavItem
                    href="#"
                    label="Eliminar ficha"
                    icon={<FaTrashAlt />}
                    className="text-red-600 hover:bg-red-100"
                    onClick={() => alert("¿Seguro que quieres eliminar la ficha?")}
                />
            </div>
        </aside>
    );
}

function NavItem({ href, label, icon, active = false, className = "", onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-blue-100 ${active ? "bg-blue-100 font-semibold text-blue-700" : "text-gray-700"
                } ${className}`}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
