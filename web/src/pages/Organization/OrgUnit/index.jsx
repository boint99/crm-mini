import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  Users,
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Maximize2,
  Minimize2,
  PlusCircle,
  FileText,
} from "lucide-react";

const FAKE_DATA = {
  id: "COM001",
  name: "Viettel Solutions",
  type: "COMPANY",
  code: "COM001",
  manager: "Nguyễn Văn A",
  totalEmployees: 1250,
  children: [
    {
      id: "DIV001",
      name: "Khối Kỹ Thuật",
      type: "DIVISION",
      code: "DIV001",
      manager: "Trần Văn B",
      totalEmployees: 450,
      children: [
        {
          id: "ORG001",
          name: "Trung tâm Hạ tầng",
          type: "ORG_UNIT",
          code: "ORG001",
          manager: "Lê Văn C",
          totalEmployees: 120,
          children: [
            {
              id: "ORG002",
              name: "Phòng Mạng Core",
              type: "ORG_UNIT",
              code: "ORG002",
              manager: "Phạm Văn D",
              totalEmployees: 45,
              children: [
                {
                  id: "ORG003",
                  name: "Đội IP Core",
                  type: "ORG_UNIT",
                  code: "ORG003",
                  manager: "Hoàng Văn E",
                  totalEmployees: 20,
                },
                {
                  id: "ORG004",
                  name: "Đội Bảo mật",
                  type: "ORG_UNIT",
                  code: "ORG004",
                  manager: "Đỗ Văn F",
                  totalEmployees: 25,
                },
              ],
            },
            {
              id: "ORG005",
              name: "Phòng Truyền dẫn",
              type: "ORG_UNIT",
              code: "ORG005",
              manager: "Ngô Văn G",
              totalEmployees: 75,
            },
          ],
        },
      ],
    },
    {
      id: "DIV002",
      name: "Khối Vận hành",
      type: "DIVISION",
      code: "DIV002",
      manager: "Vũ Văn H",
      totalEmployees: 300,
      children: [
        {
          id: "ORG010",
          name: "Trung tâm Điều hành",
          type: "ORG_UNIT",
          code: "ORG010",
          manager: "Bùi Văn I",
          totalEmployees: 150,
        },
      ],
    },
  ],
};

const TreeNode = ({
  node,
  level = 0,
  onSelect,
  selectedId,
  expandedIds,
  toggleExpand,
}) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const getIcon = (type) => {
    switch (type) {
      case "COMPANY":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "DIVISION":
        return <Layers className="w-4 h-4 text-indigo-500" />;
      default:
        return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 group ${
          isSelected
            ? "bg-blue-50 text-blue-700 shadow-sm"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        <div
          className="mr-1 p-1 hover:bg-white rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>
        <div className="mr-2">{getIcon(node.type)}</div>
        <span
          className={`text-sm font-medium truncate ${isSelected ? "font-semibold" : ""}`}
        >
          {node.code} - {node.name}
        </span>
        <div className="ml-auto opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgUnit = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set(["COM001", "DIV001"]));
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const expandAll = () => {
    const ids = new Set();
    const traverse = (node) => {
      ids.add(node.id);
      if (node.children) node.children.forEach(traverse);
    };
    traverse(FAKE_DATA);
    setExpandedIds(ids);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Org Tree */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Cơ cấu tổ chức</h2>
            <div className="flex gap-1">
              <button
                onClick={expandAll}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Mở rộng tất cả"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={collapseAll}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Thu gọn tất cả"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng ban..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <TreeNode
            node={FAKE_DATA}
            onSelect={setSelectedNode}
            selectedId={selectedNode?.id}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
          />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button className="flex items-center justify-center w-full gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm">
            <PlusCircle className="w-4 h-4 text-blue-600" />
            Thêm đơn vị mới
          </button>
        </div>
      </div>

      {/* Main Content - Detail View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNode ? (
          <div className="flex-1 overflow-y-auto p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header Detail */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                  {/* <span>COMPANY</span> */}
                  {/* <ChevronRight className="w-3 h-3" /> */}
                  {/* <span>{selectedNode.type}</span> */}
                </nav>
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                  {/* {selectedNode.name} */}
                  <span className="text-sm font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                    {/* {selectedNode.code} */}
                  </span>
                </h1>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  Chỉnh sửa đơn vị
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Tổng nhân sự
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedNode.totalEmployees}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Layers className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Đơn vị trực thuộc
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedNode.children?.length || 0}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Loại hình
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedNode.type === "COMPANY"
                      ? "Công ty"
                      : selectedNode.type === "DIVISION"
                        ? "Khối"
                        : "Phòng ban"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info and Sub-units */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6">
                    Thông tin lãnh đạo
                  </h3>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 flex items-center justify-center text-slate-500 text-2xl font-bold ring-4 ring-slate-50">
                      {selectedNode.manager.split(" ").pop()[0]}
                    </div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {selectedNode.manager}
                    </h4>
                    <p className="text-sm text-slate-500 mb-6 font-medium">
                      Trưởng đơn vị / Quản lý
                    </p>
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>
                          {selectedNode.code.toLowerCase()}@viettel.vn
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>+84 988 123 456</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-600 transition-colors">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Tòa nhà Viettel, Hà Nội</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">
                      Cấp dưới trực tiếp
                    </h3>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase">
                      Danh sách chi tiết
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                          <th className="px-6 py-4">Mã đơn vị</th>
                          <th className="px-6 py-4">Tên đơn vị</th>
                          <th className="px-6 py-4">Trưởng đơn vị</th>
                          <th className="px-6 py-4 text-right">Nhân sự</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedNode.children?.length > 0 ? (
                          selectedNode.children.map((child) => (
                            <tr
                              key={child.id}
                              className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                              onClick={() => setSelectedNode(child)}
                            >
                              <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                {child.code}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                {child.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {child.manager}
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                                {child.totalEmployees}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-6 py-12 text-center text-slate-400 italic"
                            >
                              Không có đơn vị trực thuộc
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white m-8 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
              <Layers className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Chào mừng bạn!
            </h2>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              Vui lòng chọn một đơn vị từ cây sơ đồ bên trái để xem thông tin
              chi tiết, nhân sự và cấu trúc tổ chức.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedNode(FAKE_DATA)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                Xem Công ty Tổng
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
};

export default OrgUnit;
