import React, { useState, useEffect, useRef } from "react";

type TableProps = {
  data: { id: number; name: string; age: number; email: string }[];
};

const Tabla: React.FC<TableProps> = ({ data }) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [showFilter, setShowFilter] = useState<string | null>(null);
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const tableRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (column: string, value: string) => {
    setFilters({ ...filters, [column]: value });
  };

  const toggleFilter = (column: string) => {
    setShowFilter((prev) => (prev === column ? null : column));
  };

  const handleSort = (column: string) => {
    if (sortedColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };

  const filteredData = data
    .filter((row) =>
      Object.keys(filters).every((column) =>
        row[column as keyof typeof row]
          .toString()
          .toLowerCase()
          .includes(filters[column]?.toLowerCase() || "")
      )
    )
    .sort((a, b) => {
      if (!sortedColumn) return 0;
      const valueA = a[sortedColumn as keyof typeof a];
      const valueB = b[sortedColumn as keyof typeof b];
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Cerrar el filtro al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node)
      ) {
        setShowFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4" ref={tableRef}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              {["id", "name", "age", "email"].map((column) => (
                <th key={column} className="relative border border-gray-300 p-2">
                  <div className="flex items-center justify-between">
                    {/* Título con ordenación */}
                    <button
                      onClick={() => handleSort(column)}
                      className="flex items-center text-left focus:outline-none"
                    >
                      <span className="capitalize">{column}</span>
                      {sortedColumn === column && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                    {/* Botón para filtro */}
                    <button
                      onClick={() => toggleFilter(column)}
                      className="ml-2 text-gray-600 hover:text-gray-900"
                    >
                      &#x25BC;
                    </button>
                  </div>
                  {/* Filtro por columna */}
                  {showFilter === column && (
                    <div className="absolute top-full left-0 z-10 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg">
                      <input
                        type="text"
                        placeholder={`Buscar en ${column}...`}
                        value={filters[column] || ""}
                        onChange={(e) =>
                          handleFilterChange(column, e.target.value)
                        }
                        className="w-full p-2 text-sm border-b border-gray-300 focus:outline-none"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} className="odd:bg-gray-100">
                <td className="border border-gray-300 p-2">{row.id}</td>
                <td className="border border-gray-300 p-2">{row.name}</td>
                <td className="border border-gray-300 p-2">{row.age}</td>
                <td className="border border-gray-300 p-2">{row.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tabla;
