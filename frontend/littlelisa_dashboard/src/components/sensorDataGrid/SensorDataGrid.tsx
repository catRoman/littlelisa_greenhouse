import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

export default function SensorDataGrid() {
  // Row Data: The data to be displayed.
  const rowData = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  ];

  // Column Definitions: Defines the columns to be displayed.
  const colDefs: ColDef[] = [
    { field: "make", headerName: "Test" },
    { field: "model", headerName: "Test" },
    { field: "price", headerName: "Test" },
    { field: "electric", headerName: "Test" },
  ];

  // ...

  return (
    <div className="ag-theme-quartz-dark h-80">
      <AgGridReact rowData={rowData} columnDefs={colDefs} />
    </div>
  );
}
