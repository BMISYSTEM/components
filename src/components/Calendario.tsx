import React, { useState } from "react";

type Note = {
  date: string; // Fecha en formato YYYY-MM-DD
  text: string; // Texto de la nota
};

const Calendario: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");

  // Obtener información del mes actual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Crear días del mes con espacios iniciales para el primer día
  const days = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // Cambiar mes
  const changeMonth = (increment: number) => {
    const newDate = new Date(year, month + increment, 1);
    setCurrentDate(newDate);
  };

  // Manejar clic en un día
  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    setSelectedDate(formattedDate);
  };

  // Guardar nota
  const handleSaveNote = () => {
    if (selectedDate && noteText.trim()) {
      setNotes((prevNotes) => [
        ...prevNotes,
        { date: selectedDate, text: noteText },
      ]);
      setNoteText("");
      setSelectedDate(null);
    }
  };

  // Obtener notas por fecha
  const getNotesByDate = (date: string) =>
    notes.filter((note) => note.date === date);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          &lt; Anterior
        </button>
        <h1 className="text-xl font-bold">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h1>
        <button
          onClick={() => changeMonth(1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Siguiente &gt;
        </button>
      </div>

      {/* Encabezados de días */}
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dayName) => (
          <div key={dayName} className="text-center font-medium border-b pb-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2 flex-grow">
        {days.map((day, index) => {
          const formattedDate =
            day &&
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
              2,
              "0"
            )}`;
          const dayNotes = formattedDate ? getNotesByDate(formattedDate) : [];
          return (
            <div
              key={index}
              className={`h-28 border flex flex-col p-2 bg-white ${
                day ? "cursor-pointer hover:bg-gray-100" : "bg-gray-50"
              }`}
              onClick={() => handleDayClick(day)}
            >
              {/* Número del día */}
              <div className="text-right text-sm font-semibold">{day}</div>

              {/* Notas visibles */}
              <div className="mt-1 flex flex-col space-y-1 overflow-y-auto">
                {dayNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs truncate"
                    title={note.text}
                  >
                    {note.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para agregar notas */}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">
              Notas para el {selectedDate}
            </h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring"
              placeholder="Escribe tu nota aquí..."
            />
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
            <div className="mt-4">
              {getNotesByDate(selectedDate).map((note, idx) => (
                <div
                  key={idx}
                  className="mt-2 p-2 border rounded-md bg-gray-50 text-gray-800"
                >
                  {note.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
