import LoadingItem from "@/components/ui/LoadingItem";
import { dispatchWithToast } from "@/components/ui/dispatchWithToast";
import { useAppDispatch } from "@/hook/useAppDispatch";
import {
  getVlans,
  createVlan,
  updateVlan,
  deleteVlan,
  selectVlans,
  selectVlansLoading,
} from "@/redux/slice/vlansSlice";
import {
  getIps,
  createIp,
  updateIp,
  deleteIp,
  selectIps,
  selectIpsLoading,
} from "@/redux/slice/ipsSlice";
import { CUSTOM_MESSAGES } from "@/utils/contants";
import {
  Plus,
  Search,
  Download,
  Network,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import VlanModal from "./VlanModal";
import IpModal from "./IpModal";

function StatusBadge({ status }) {
  const config = {
    ACTIVE: {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      label: "Online",
    },
    INACTIVE: {
      dot: "bg-gray-400",
      text: "text-gray-600",
      bg: "bg-gray-100",
      label: "Offline",
    },
  };
  const c = config[status] || config.INACTIVE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function DeviceTypeBadge({ type }) {
  if (!type) return <span className="text-gray-400">—</span>;
  const isStatic = type.toUpperCase() === "STATIC";
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
        isStatic ? "bg-gray-200 text-gray-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {type}
    </span>
  );
}

export default function Networks() {
  const [vlanDropdownOpen, setVlanDropdownOpen] = useState(false);
  const [selectedVlanId, setSelectedVlanId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // VLAN modal
  const [vlanModalOpen, setVlanModalOpen] = useState(false);
  const [vlanMode, setVlanMode] = useState("create");
  const [selectedVlanData, setSelectedVlanData] = useState(null);

  // IP modal
  const [ipModalOpen, setIpModalOpen] = useState(false);
  const [ipMode, setIpMode] = useState("create");
  const [selectedIpData, setSelectedIpData] = useState(null);

  const dispatchAsync = useAppDispatch();
  const dispatch = useDispatch();
  const vlans = useSelector(selectVlans);
  const vlansLoading = useSelector(selectVlansLoading);
  const ips = useSelector(selectIps);
  const ipsLoading = useSelector(selectIpsLoading);

  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatchAsync(getVlans());
    dispatchAsync(getIps());
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setVlanDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-select first VLAN
  useEffect(() => {
    if (vlans.length > 0 && !selectedVlanId) {
      setSelectedVlanId(vlans[0].VLAN_ID);
    }
  }, [vlans, selectedVlanId]);

  const selectedVlan = useMemo(
    () => vlans.find((v) => v.VLAN_ID === selectedVlanId),
    [vlans, selectedVlanId],
  );

  // Filter IPs for the selected VLAN
  const filteredIps = useMemo(() => {
    let list = ips.filter((ip) => ip.VLAN_ID === selectedVlanId);
    if (statusFilter !== "ALL") {
      list = list.filter((ip) => ip.STATUS === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((ip) => {
        const hay = [ip.HOST, ip.DEVICE_TYPE, ip.EMPLOYEE_ID, ip.STATUS]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [ips, selectedVlanId, statusFilter, query]);

  // ── VLAN actions ──
  const openCreateVlan = () => {
    setVlanMode("create");
    setSelectedVlanData(null);
    setVlanModalOpen(true);
  };

  const openEditVlan = () => {
    if (!selectedVlan) return;
    setVlanMode("edit");
    setSelectedVlanData(selectedVlan);
    setVlanModalOpen(true);
  };

  const openDeleteVlan = () => {
    if (!selectedVlan) return;
    setVlanMode("delete");
    setSelectedVlanData(selectedVlan);
    setVlanModalOpen(true);
  };

  const handleVlanSubmit = async (payload) => {
    if (vlanMode === "delete") {
      await dispatchWithToast({
        dispatch,
        action: deleteVlan,
        payload,
        messages: CUSTOM_MESSAGES.delete,
      });
      setSelectedVlanId(null);
    } else if (vlanMode === "edit") {
      await dispatchWithToast({
        dispatch,
        action: updateVlan,
        payload,
        messages: CUSTOM_MESSAGES.update,
      });
    } else {
      await dispatchWithToast({
        dispatch,
        action: createVlan,
        payload,
        messages: CUSTOM_MESSAGES.create,
      });
    }
    setVlanModalOpen(false);
    setSelectedVlanData(null);
  };

  // ── IP actions ──
  const openCreateIp = () => {
    setIpMode("create");
    setSelectedIpData(null);
    setIpModalOpen(true);
  };

  const openEditIp = (ip) => {
    setIpMode("edit");
    setSelectedIpData(ip);
    setIpModalOpen(true);
  };

  const openDeleteIp = (ip) => {
    setIpMode("delete");
    setSelectedIpData(ip);
    setIpModalOpen(true);
  };

  const handleIpSubmit = async (payload) => {
    if (ipMode === "delete") {
      await dispatchWithToast({
        dispatch,
        action: deleteIp,
        payload,
        messages: CUSTOM_MESSAGES.delete,
      });
    } else if (ipMode === "edit") {
      await dispatchWithToast({
        dispatch,
        action: updateIp,
        payload,
        messages: CUSTOM_MESSAGES.update,
      });
    } else {
      await dispatchWithToast({
        dispatch,
        action: createIp,
        payload,
        messages: CUSTOM_MESSAGES.create,
      });
    }
    setIpModalOpen(false);
    setSelectedIpData(null);
  };

  // CSV export
  const handleExport = () => {
    if (!filteredIps.length) return;
    const headers = ["IP Address", "Device Type", "Employee ID", "Status"];
    const rows = filteredIps.map((ip) => [
      ip.HOST,
      ip.DEVICE_TYPE || "",
      ip.EMPLOYEE_ID || "",
      ip.STATUS,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vlan-${selectedVlan?.VLAN_CODE || "ips"}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý mạng</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure network segments and manage address space allocation.
        </p>
      </div>

      {/* ── VLAN Detail ── */}
      {vlansLoading ? (
        <div className="mt-6">
          <LoadingItem />
        </div>
      ) : vlans.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-gray-400">
          <Network className="h-10 w-10 mb-2" />
          <p className="text-sm">Chưa có VLAN nào</p>
        </div>
      ) : selectedVlan ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">
                VLAN {selectedVlan.VLAN_CODE}
              </h2>
              <span className="text-sm text-gray-500">
                {selectedVlan.VLAN_NAME}
              </span>
              <StatusBadge status={selectedVlan.STATUS} />
            </div>
            <div className="flex items-center gap-2">
              {/* VLAN Dropdown Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setVlanDropdownOpen(!vlanDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Network className="h-3.5 w-3.5" />
                  VLAN {selectedVlan.VLAN_CODE}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${vlanDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {vlanDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-64 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                        Select VLAN · {vlans.length} Defined
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {vlans.map((vlan) => (
                        <button
                          key={vlan.VLAN_ID}
                          onClick={() => {
                            setSelectedVlanId(vlan.VLAN_ID);
                            setVlanDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 cursor-pointer transition-colors ${
                            vlan.VLAN_ID === selectedVlanId ? "bg-blue-50" : ""
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              vlan.VLAN_ID === selectedVlanId
                                ? "border-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {vlan.VLAN_ID === selectedVlanId && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              VLAN {vlan.VLAN_CODE}
                              <span className="ml-1.5 text-[11px] font-normal text-gray-400">
                                {vlan.VLAN_NAME}
                              </span>
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {vlan.NETWORK || "—"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={openCreateVlan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm VLAN
              </button>
              <button
                onClick={openEditVlan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa
              </button>
              <button
                onClick={openDeleteVlan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Network
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedVlan.NETWORK || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Gateway
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedVlan.DEFAULT_GATEWAY || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Subnet Mask
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                /{selectedVlan.SUBNET_MASK || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                IP Range
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {selectedVlan.IP_RANGE || "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── IP Allocation Table ── */}
      {selectedVlan && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">IP Allocation</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                VLAN {selectedVlan.VLAN_CODE} Active View
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search IP or Device..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-48 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 cursor-pointer"
                title="Export CSV"
              >
                <Download className="h-4 w-4" />
              </button>

              {/* Add IP */}
              <button
                onClick={openCreateIp}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add IP
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Device Name
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {ipsLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <LoadingItem />
                    </td>
                  </tr>
                ) : filteredIps.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Network className="h-8 w-8 mb-2" />
                        <p className="text-sm">
                          Không có IP nào trong VLAN này
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIps.map((ip) => (
                    <tr key={ip.IP_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="font-semibold text-primary">
                          {ip.HOST}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                        {ip.DEVICE_TYPE || "—"}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        {ip.EMPLOYEE_ID || "—"}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <DeviceTypeBadge type={ip.DEVICE_TYPE} />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <StatusBadge status={ip.STATUS} />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditIp(ip)}
                            className="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteIp(ip)}
                            className="rounded-md p-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <VlanModal
        isOpen={vlanModalOpen}
        onClose={() => {
          setVlanModalOpen(false);
          setSelectedVlanData(null);
        }}
        onSubmit={handleVlanSubmit}
        mode={vlanMode}
        data={selectedVlanData}
      />
      <IpModal
        isOpen={ipModalOpen}
        onClose={() => {
          setIpModalOpen(false);
          setSelectedIpData(null);
        }}
        onSubmit={handleIpSubmit}
        mode={ipMode}
        data={selectedIpData}
        vlanId={selectedVlanId}
      />
    </div>
  );
}
