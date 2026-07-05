"use client";

import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { whatsappApi, WhatsAppConfig, VendorAvailability, BusinessHours, User } from "@/lib/whatsapp";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type LinkingStatus = 'idle' | 'generating' | 'waiting_scan' | 'linking' | 'connected' | 'error';

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkingStatus, setLinkingStatus] = useState<LinkingStatus>('idle');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const [timezone, setTimezone] = useState("America/Mexico_City");
  const [closedMessage, setClosedMessage] = useState("");
  const [newVendorUserId, setNewVendorUserId] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  useEffect(() => {
    loadConfig();
    loadUsers();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const loadConfig = async () => {
    try {
      const data = await whatsappApi.getConfig();
      setConfig(data);
      setTimezone(data.timezone);
      setClosedMessage(data.closedMessage || "");
      setBusinessHours(data.businessHours);
      
      if (data.isConnected) {
        setLinkingStatus('connected');
      } else {
        setLinkingStatus('idle');
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await whatsappApi.getStoreUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const startPollingStatus = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const status = await whatsappApi.getConnectionStatus();
        console.log('Polling status:', status);
        
        if (status.isConnected) {
          setLinkingStatus('connected');
          setQrImage(null);
          setErrorMessage(null);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          await loadConfig();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleGenerateQR = async () => {
    setLinkingStatus('generating');
    setErrorMessage(null);
    setQrImage(null);
    
    try {
      const data = await whatsappApi.generateQR();
      setQrImage(data.qr);
      setLinkingStatus('waiting_scan');
      startPollingStatus();
    } catch (error: any) {
      console.error("Error generating QR:", error);
      setErrorMessage(error.message || "Error al generar QR");
      setLinkingStatus('error');
    }
  };

  const handleGenerateQRWithPhone = async (phone: string) => {
    setLinkingStatus('generating');
    setErrorMessage(null);
    setQrImage(null);
    setShowPhoneModal(false);

    let phoneToSend = phone.trim();

    const cleanPhone = phoneToSend.replace(/\D/g, '');

    if (cleanPhone.length === 8) {
      phoneToSend = `+504${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('504')) {
      phoneToSend = `+${cleanPhone}`;
    } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('504')) {
      phoneToSend = `+504${cleanPhone.slice(2)}`;
    }

    console.log(`Phone input: ${phone} -> sending: ${phoneToSend}`);

    try {
      const data = await whatsappApi.generateQRWithPhone(phoneToSend);
      setQrImage(data.qr);
      setLinkingStatus('waiting_scan');
      startPollingStatus();
    } catch (error: any) {
      console.error("Error generating pairing code:", error);
      const errorMsg = error.message || "Error al generar código de vinculación";
      setErrorMessage(errorMsg);
      setLinkingStatus('error');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desvincular este número de WhatsApp?')) return;
    
    setDisconnecting(true);
    stopPolling();
    try {
      await whatsappApi.disconnect();
      setLinkingStatus('idle');
      setQrImage(null);
      setErrorMessage(null);
      await loadConfig();
    } catch (error: any) {
      console.error("Error disconnecting:", error);
      setErrorMessage(error.message || "Error al desvincular");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await whatsappApi.updateSettings({ timezone, closedMessage });
      await loadConfig();
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendorUserId || !newVendorPhone) return;
    try {
      await whatsappApi.addVendor(newVendorUserId, newVendorPhone);
      await loadConfig();
      setNewVendorUserId("");
      setNewVendorPhone("");
    } catch (error) {
      console.error("Error adding vendor:", error);
    }
  };

  const handleRemoveVendor = async (userId: string) => {
    try {
      await whatsappApi.removeVendor(userId);
      await loadConfig();
    } catch (error) {
      console.error("Error removing vendor:", error);
    }
  };

  const handleToggleVendorAvailability = async (userId: string, isAvailable: boolean) => {
    try {
      await whatsappApi.setVendorAvailability(userId, isAvailable);
      await loadConfig();
    } catch (error) {
      console.error("Error toggling vendor:", error);
    }
  };

  const handleSetBusinessHours = async (
    dayOfWeek: number,
    openTime: string,
    closeTime: string,
    isActive: boolean
  ) => {
    try {
      await whatsappApi.setBusinessHours(dayOfWeek, openTime, closeTime, isActive);
      await loadConfig();
    } catch (error) {
      console.error("Error setting business hours:", error);
    }
  };

  const handleSetDefaultHours = async () => {
    try {
      await whatsappApi.setDefaultBusinessHours();
      await loadConfig();
    } catch (error) {
      console.error("Error setting default hours:", error);
    }
  };

  const renderConnectionSection = () => {
    switch (linkingStatus) {
      case 'generating':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Generando código QR...</p>
          </div>
        );

      case 'waiting_scan':
        return (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Escanea este código QR con WhatsApp para vincular tu número
            </p>
            {qrImage && (
              <div className="bg-white border-2 border-dashed border-indigo-300 rounded-xl p-4 inline-block mb-4">
                <QRCodeSVG value={qrImage} size={256} />
              </div>
            )}
            <div className="animate-pulse mt-4">
              <p className="text-indigo-600 text-sm">Esperando vinculación...</p>
              <div className="flex justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Para vincular: WhatsApp {'>'} Ajustes {'>'} Dispositivos vinculados {'>'} Vincular dispositivo {'>'} Escanear código QR
            </p>
            <button
              onClick={() => {
                setLinkingStatus('idle');
                setQrImage(null);
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm"
            >
              Cancelar
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-6">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 mb-4">{errorMessage}</p>
            <button
              onClick={handleGenerateQR}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </div>
        );

      case 'connected':
        return (
          <div className="text-center py-6">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-green-700 font-medium text-lg mb-2">¡WhatsApp vinculado correctamente!</p>
            {config?.phone && (
              <p className="text-gray-600 mb-2">Número: {config.phone}</p>
            )}
            {config?.connectedAt && (
              <p className="text-sm text-gray-500 mb-4">
                Vinculado el: {new Date(config.connectedAt).toLocaleString()}
              </p>
            )}
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {disconnecting ? "Desvinculando..." : "Desvincular número"}
            </button>
          </div>
        );

      case 'linking':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Vinculando número...</p>
          </div>
        );

      case 'idle':
      default:
        return (
          <div className="text-center py-6">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              Vincular un número de WhatsApp para recibir mensajes de clientes
            </p>
            <button
              onClick={() => setShowPhoneModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Vincular WhatsApp
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de WhatsApp</h1>
        <p className="text-gray-600">Vincular número, horarios y vendedores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Connection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conexión WhatsApp</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  linkingStatus === 'connected' ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {linkingStatus === 'connected' ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>

          {renderConnectionSection()}
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Horarios de Atención</h2>
            <button
              onClick={handleSetDefaultHours}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Restaurar horario default
            </button>
          </div>

          <div className="space-y-3">
            {businessHours.map((hours) => (
              <div key={hours.dayOfWeek} className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium">{DAY_NAMES[hours.dayOfWeek]}</span>
                <input
                  type="time"
                  defaultValue={hours.openTime}
                  onChange={(e) =>
                    handleSetBusinessHours(
                      hours.dayOfWeek,
                      e.target.value,
                      hours.closeTime,
                      hours.isActive
                    )
                  }
                  className="border rounded px-2 py-1 text-sm"
                  disabled={!hours.isActive}
                />
                <span>-</span>
                <input
                  type="time"
                  defaultValue={hours.closeTime}
                  onChange={(e) =>
                    handleSetBusinessHours(
                      hours.dayOfWeek,
                      hours.openTime,
                      e.target.value,
                      hours.isActive
                    )
                  }
                  className="border rounded px-2 py-1 text-sm"
                  disabled={!hours.isActive}
                />
                <label className="flex items-center gap-1 ml-2">
                  <input
                    type="checkbox"
                    checked={hours.isActive}
                    onChange={(e) =>
                      handleSetBusinessHours(
                        hours.dayOfWeek,
                        hours.openTime,
                        hours.closeTime,
                        e.target.checked
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-xs text-gray-500">Activo</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Closed Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Mensaje Fuera de Horario</h2>
          <textarea
            value={closedMessage}
            onChange={(e) => setClosedMessage(e.target.value)}
            placeholder="Gracias por escribirnos. Nuestro horario de atención es..."
            className="w-full border rounded-lg p-3 text-sm"
            rows={3}
          />
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Mensaje"}
          </button>
        </div>

        {/* Timezone */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Zona Horaria</h2>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
            <option value="America/Bogota">Bogotá (UTC-5)</option>
            <option value="America/Lima">Lima (UTC-5)</option>
            <option value="America/New_York">Nueva York (UTC-5)</option>
            <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
          </select>
        </div>

        {/* Vendors */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Vendedores</h2>

          <div className="mb-4 flex gap-3">
            <select
              value={newVendorUserId}
              onChange={(e) => setNewVendorUserId(e.target.value)}
              className="flex-1 border rounded-lg p-2"
            >
              <option value="">Seleccionar usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newVendorPhone}
              onChange={(e) => setNewVendorPhone(e.target.value)}
              placeholder="WhatsApp (ej: +521234567890)"
              className="flex-1 border rounded-lg p-2"
            />
            <button
              onClick={handleAddVendor}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Agregar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Nombre</th>
                  <th className="text-left py-2 px-3">WhatsApp</th>
                  <th className="text-left py-2 px-3">Estado</th>
                  <th className="text-right py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {config?.vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b">
                    <td className="py-2 px-3">{vendor.userName}</td>
                    <td className="py-2 px-3">{vendor.phone}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          vendor.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vendor.isAvailable ? "Disponible" : "Ocupado"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleToggleVendorAvailability(vendor.userId, !vendor.isAvailable)}
                        className="text-indigo-600 hover:text-indigo-800 mr-3"
                      >
                        {vendor.isAvailable ? "Marcar ocupado" : "Marcar disponible"}
                      </button>
                      <button
                        onClick={() => handleRemoveVendor(vendor.userId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!config?.vendors || config.vendors.length === 0) && (
              <p className="text-center text-gray-500 py-4">No hay vendedores configurados</p>
            )}
          </div>
        </div>
      </div>

      {/* Phone Modal for Pairing Code */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Vincular WhatsApp</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ingresa el número de WhatsApp que deseas vincular. Se generará un código QR para vincular este número.
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Ingresa el número con el que usarás el bot (ej: 94692687 para Honduras).
            </p>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="94692687"
              className="w-full border rounded-lg p-3 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPhoneModal(false);
                  setPhoneInput("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleGenerateQRWithPhone(phoneInput)}
                disabled={!phoneInput.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Generar QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
