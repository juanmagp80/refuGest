import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCheckCircle, FaHome, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

export default function MenuVoluntarioHorizontal({ onLogout }) {
    const pathname = usePathname();

    const links = [
        { href: "/voluntario/perfil", label: "Perfil", icon: <FaUserCircle /> },
        { href: "/voluntario/tareas", label: "Mis tareas", icon: <FaCheckCircle /> },
        { href: "/voluntario/refugio", label: "Refugio", icon: <FaHome /> },
    ];

    return (
        <nav className="w-full bg-white shadow-md flex items-center justify-between px-8 py-3 fixed top-0 left-0 z-50 border-b border-gray-200">
            <div className="flex gap-6">
                {links.map(({ href, label, icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${pathname === href
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {icon}
                        {label}
                    </Link>
                ))}
            </div>

            <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white px-4 py-2 rounded-md font-bold shadow-sm transition"
            >
                <FaSignOutAlt />
                Cerrar sesión
            </button>
        </nav>
    );
}
