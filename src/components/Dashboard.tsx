import React, { useState } from "react";

interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

const GRID_SIZE = 100; // Tamaño de cada celda en px
const INITIAL_COLUMNS = 4; // Número inicial de columnas
const INITIAL_ROWS = 4; // Número inicial de filas

const Dashboard: React.FC = () => {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);

  // Verifica si las celdas están disponibles
  const isSpaceAvailable = (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId: string | null = null
  ) => {
    for (let item of gridItems) {
      if (item.id === excludeId) continue;

      // Verificar superposición
      if (
        x < item.x + item.width &&
        x + width > item.x &&
        y < item.y + item.height &&
        y + height > item.y
      ) {
        return false;
      }
    }
    return true;
  };

  const handleDrop = (x: number, y: number) => {
    if (!draggingItem) return;

    setGridItems((prev) => {
      const draggingIndex = prev.findIndex((item) => item.id === draggingItem);

      if (draggingIndex !== -1) {
        // Actualizar posición de un componente existente
        const updatedItems = [...prev];
        const newItem = { ...updatedItems[draggingIndex], x, y };

        if (isSpaceAvailable(x, y, newItem.width, newItem.height, draggingItem)) {
          updatedItems[draggingIndex] = newItem;
        }
        return updatedItems;
      }

      // Agregar un nuevo componente
      const newItem: GridItem = {
        id: draggingItem,
        x,
        y,
        width: 1,
        height: 1,
        content: draggingItem,
      };

      if (isSpaceAvailable(x, y, 1, 1)) {
        return [...prev, newItem];
      }

      return prev; // Si no hay espacio, no agregar
    });

    setDraggingItem(null);
  };

  const handleResize = (id: string, newWidth: number, newHeight: number) => {
    setGridItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newItem = {
            ...item,
            width: 20,
            height: 30,
          };

          if (isSpaceAvailable(newItem.x, newItem.y, newItem.width, newItem.height, id)) {
            return newItem;
          }
        }
        return item;
      })
    );
  };

  return (
    <div className="flex">
      {/* Lista de componentes */}
      <div className="w-1/4 p-4 border-r border-gray-300">
        <h3 className="text-lg font-bold mb-4">Componentes</h3>
        {["Componente 1", "Componente 2", "Componente 3"].map((item) => (
          <div
            key={item}
            draggable
            onDragStart={() => setDraggingItem(item)}
            className="p-2 mb-2 bg-blue-100 border border-blue-400 rounded cursor-pointer"
          >
            {item}
          </div>
        ))}
      </div>

      {/* Tablero */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${INITIAL_COLUMNS}, ${GRID_SIZE}px)`,
          gridTemplateRows: `repeat(${INITIAL_ROWS}, ${GRID_SIZE}px)`,
          gap: "0px",
          position: "relative",
        }}
      >
        {/* Espacios de la cuadrícula */}
        {Array.from({ length: INITIAL_COLUMNS * INITIAL_ROWS }).map((_, index) => {
          const x = index % INITIAL_COLUMNS;
          const y = Math.floor(index / INITIAL_COLUMNS);

          return (
            <div
              key={`${x}-${y}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(x, y)}
              className="border border-gray-300 bg-gray-100"
              style={{
                width: GRID_SIZE,
                height: GRID_SIZE,
              }}
            >
              {gridItems.map(
                (item) =>
                  item.x === x &&
                  item.y === y && (
                    <GridItemComponent
                      key={item.id}
                      item={item}
                      onResize={handleResize}
                    />
                  )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface GridItemComponentProps {
  item: GridItem;
  onResize: (id: string, width: number, height: number) => void;
}

const GridItemComponent: React.FC<GridItemComponentProps> = ({
  item,
  onResize,
}) => {
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;

    const initialWidth = 10;
    const initialHeight = 10;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.floor((moveEvent.clientX - startX) / 10);
      const deltaY = Math.floor((moveEvent.clientY - startY) / 10);

      onResize(item.id, initialWidth + deltaX, initialHeight + deltaY);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      style={{
        gridColumn: `span ${10}`,
        gridRow: `span ${10}`,
        position: "relative",
        backgroundColor: "lightblue",
        border: "1px solid blue",
        width: "50%",
        height: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {item.content}
      <div
        className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 cursor-se-resize"
        onMouseDown={handleResizeStart}
      ></div>
    </div>
  );
};

export default Dashboard;
