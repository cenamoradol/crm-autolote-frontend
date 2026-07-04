"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"conversations" | "settings">("conversations");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Bot</h1>
        <p className="text-gray-600">Gestiona el bot de WhatsApp y conversaciones con clientes.</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("conversations")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "conversations"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Conversaciones
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Configuración
          </button>
        </nav>
      </div>

      {activeTab === "conversations" ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Conversaciones</h2>
            <Link
              href="/whatsapp/conversations"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>Cargando conversaciones...</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Configuración del Bot</h2>
            <Link
              href="/whatsapp/settings"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Abrir configuración →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>Ir a configuración para vincular WhatsApp y gestionar horarios.</p>
          </div>
        </div>
      )}
    </div>
  );
}
