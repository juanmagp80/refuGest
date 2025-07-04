// components/Sidebar.js
import Link from "next/link";
import { FaCalendar, FaChartBar, FaCog, FaEnvelope, FaFileAlt, FaFolderOpen, FaGlobe, FaMoneyBill, FaPaw, FaUsers, FaWpforms } from "react-icons/fa";

export default function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col bg-[#1E1E2D] text-white w-64 h-screen fixed left-0 top-0 z-40 shadow-lg">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <FaPaw className="text-orange-400 text-3xl" />
            </div>
            <nav className="flex-1 p-6 space-y-8 overflow-y-auto text-sm">
                <div>
                    <h4 className="uppercase text-gray-400 font-bold mb-2">General</h4>
                    <ul className="space-y-2">
                        <MenuItem href="/dashboard" label="Panel" icon={<FaChartBar />} />
                        <MenuItem href="/dashboard/calendario" label="Calendario" icon={<FaCalendar />} />
                        <MenuItem href="/dashboard/buzon" label="Buzón" icon={<FaEnvelope />} />
                        <MenuItem href="/dashboard/configuracion" label="Configuración" icon={<FaCog />} />
                        <MenuItem href="/dashboard/web" label="Página Web" icon={<FaGlobe />} />
                    </ul>
                </div>
                <div>
                    <h4 className="uppercase text-gray-400 font-bold mb-2">Gestión</h4>
                    <ul className="space-y-2">
                        <MenuItem href="/dashboard/animales" label="Animales" icon={<FaPaw />} />
                        <MenuItem href="/dashboard/personas" label="Personas" icon={<FaUsers />} />
                        <MenuItem href="/dashboard/articulos" label="Artículos" icon={<FaFileAlt />} />
                    </ul>
                </div>
                <div>
                    <h4 className="uppercase text-gray-400 font-bold mb-2">Datos</h4>
                    <ul className="space-y-2">
                        <MenuItem href="/dashboard/paginas" label="Páginas" icon={<FaGlobe />} />
                        <MenuItem href="/dashboard/formularios" label="Formularios" icon={<FaWpforms />} />
                        <MenuItem href="/dashboard/archivos" label="Archivos" icon={<FaFolderOpen />} />
                        <MenuItem href="/dashboard/finanzas" label="Finanzas" icon={<FaMoneyBill />} />
                        <MenuItem href="/dashboard/informes" label="Informes" icon={<FaChartBar />} />
                    </ul>
                </div>
            </nav>
        </aside>
    );
}

function MenuItem({ href, label, icon }) {
    return (
        <li>
            <Link
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded text-white hover:bg-orange-500 transition-all"
            >
                <span className="text-lg">{icon}</span>
                {label}
            </Link>
        </li>
    );
}
