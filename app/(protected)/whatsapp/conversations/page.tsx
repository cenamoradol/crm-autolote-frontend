"use client";

import { useEffect, useState } from "react";
import { whatsappApi, WhatsAppConversation, WhatsAppMetrics, ConversationStatus } from "@/lib/whatsapp";

const STATUS_LABELS: Record<ConversationStatus, string> = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignado",
  CLOSED: "Cerrado",
};

const STATUS_COLORS: Record<ConversationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function WhatsAppConversationsPage() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [metrics, setMetrics] = useState<WhatsAppMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ConversationStatus | "ALL">("ALL");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = filter !== "ALL" ? { status: filter } : undefined;
      const [convs, mets] = await Promise.all([
        whatsappApi.getConversations(filters),
        whatsappApi.getMetrics(),
      ]);
      setConversations(convs);
      setMetrics(mets);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConversation = async (id: string) => {
    try {
      await whatsappApi.closeConversation(id);
      await loadData();
    } catch (error) {
      console.error("Error closing conversation:", error);
    }
  };

  const formatDuration = (assignedAt?: string, closedAt?: string) => {
    if (!assignedAt || !closedAt) return "-";
    const start = new Date(assignedAt).getTime();
    const end = new Date(closedAt).getTime();
    const minutes = Math.round((end - start) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversaciones WhatsApp</h1>
        <p className="text-gray-600">Historial de conversaciones con clientes.</p>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-700">{metrics.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">En curso</p>
            <p className="text-2xl font-bold text-blue-700">{metrics.assigned}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">Tiempo promedio</p>
            <p className="text-2xl font-bold text-green-700">{metrics.avgResponseTimeMinutes} min</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === "ALL"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === "PENDING"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilter("ASSIGNED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === "ASSIGNED"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Asignadas
        </button>
        <button
          onClick={() => setFilter("CLOSED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === "CLOSED"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Cerradas
        </button>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Vendedor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hora Asignación</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hora Cierre</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Duración</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No hay conversaciones
                  </td>
                </tr>
              ) : (
                conversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{conv.customerPhone}</p>
                        {conv.customerName && (
                          <p className="text-xs text-gray-500">{conv.customerName}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {conv.vendorName || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[conv.status]}`}
                      >
                        {STATUS_LABELS[conv.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {conv.assignedAt
                        ? new Date(conv.assignedAt).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {conv.closedAt
                        ? new Date(conv.closedAt).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDuration(conv.assignedAt, conv.closedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {conv.status !== "CLOSED" && (
                        <button
                          onClick={() => handleCloseConversation(conv.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Cerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
