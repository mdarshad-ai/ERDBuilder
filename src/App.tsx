import React, { useState, useRef, useEffect } from 'react';
import DiagramBuilder from './DiagramBuilder';
import './App.css';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Types for configuration
export type TableType = 'fact' | 'dimension';
export type SCDType = 'none' | 'SCD1' | 'SCD2' | 'SCD3';

export interface ColumnConfig {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
  nullable?: boolean;
}

export interface TableConfig {
  id: string;
  name: string;
  type: TableType;
  scdType: SCDType;
  columns: ColumnConfig[];
  position?: { x: number; y: number };
}

export interface RelationshipConfig {
  id: string;
  sourceTableId: string;
  targetTableId: string;
  type: '1:N' | 'N:M';
  fkColumn: string;
}

interface Group {
  id: string;
  name: string;
  tableIds: string[];
}

interface Project {
  id: string;
  name: string;
  tables: TableConfig[];
  relationships: RelationshipConfig[];
  groups: Group[];
}

export interface GlobalGroup {
  id: string;
  name: string;
  tableRefs: { projectId: string; tableId: string }[];
}

function ConfigurationPage({
  tables,
  setTables,
  relationships,
  setRelationships,
}: {
  tables: TableConfig[];
  setTables: React.Dispatch<React.SetStateAction<TableConfig[]>>;
  relationships: RelationshipConfig[];
  setRelationships: React.Dispatch<React.SetStateAction<RelationshipConfig[]>>;
}) {
  const [tableName, setTableName] = useState('');
  const [tableType, setTableType] = useState<TableType>('fact');
  const [scdType, setSCDType] = useState<SCDType>('none');

  // Column form state
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('string');
  const [isPK, setIsPK] = useState(false);
  const [isFK, setIsFK] = useState(false);
  const [nullable, setNullable] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Relationship form state
  const [sourceTableId, setSourceTableId] = useState('');
  const [targetTableId, setTargetTableId] = useState('');
  const [relType, setRelType] = useState<'1:N' | 'N:M'>('1:N');
  const [fkColumn, setFKColumn] = useState('');

  function addTable(e: React.FormEvent) {
    e.preventDefault();
    if (!tableName.trim()) return;
    setTables(tables => [
      ...tables,
      {
        id: Date.now().toString(),
        name: tableName,
        type: tableType,
        scdType,
        columns: [],
      },
    ]);
    setTableName('');
    setTableType('fact');
    setSCDType('none');
  }

  function addColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTableId || !columnName.trim()) return;
    setTables(tables => tables.map(table =>
      table.id === selectedTableId
        ? {
            ...table,
            columns: [
              ...table.columns,
              {
                name: columnName,
                type: columnType,
                isPK,
                isFK,
                nullable,
              },
            ],
          }
        : table
    ));
    setColumnName('');
    setColumnType('string');
    setIsPK(false);
    setIsFK(false);
    setNullable(false);
  }

  function deleteColumn(tableId: string, colIdx: number) {
    setTables(tables => tables.map(table =>
      table.id === tableId
        ? { ...table, columns: table.columns.filter((_, i) => i !== colIdx) }
        : table
    ));
  }

  function addRelationship(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceTableId || !targetTableId || !fkColumn) return;
    setRelationships(rels => [
      ...rels,
      {
        id: Date.now().toString(),
        sourceTableId,
        targetTableId,
        type: relType,
        fkColumn,
      },
    ]);
    setSourceTableId('');
    setTargetTableId('');
    setRelType('1:N');
    setFKColumn('');
  }

  function deleteRelationship(relId: string) {
    setRelationships(rels => rels.filter(r => r.id !== relId));
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Configuration</h2>
      <form onSubmit={addTable} style={{ marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={tableName}
          onChange={e => setTableName(e.target.value)}
          placeholder="Table name"
          required
        />
        <select value={tableType} onChange={e => setTableType(e.target.value as TableType)}>
          <option value="fact">Fact</option>
          <option value="dimension">Dimension</option>
        </select>
        <select value={scdType} onChange={e => setSCDType(e.target.value as SCDType)}>
          <option value="none">No SCD</option>
          <option value="SCD1">SCD1</option>
          <option value="SCD2">SCD2</option>
          <option value="SCD3">SCD3</option>
        </select>
        <button type="submit">Add Table</button>
      </form>
      <div>
        <h3>Tables</h3>
        <ul>
          {tables.map(table => (
            <li key={table.id} style={{ marginBottom: 16 }}>
              <b>{table.name}</b> ({table.type}, {table.scdType})
              <ul>
                {table.columns.map((col, idx) => (
                  <li key={idx}>
                    {col.name} : {col.type}
                    {col.isPK && ' [PK]'}
                    {col.isFK && ' [FK]'}
                    {col.nullable && ' [NULLABLE]'}
                    <button style={{ marginLeft: 8 }} onClick={() => deleteColumn(table.id, idx)} type="button">Delete</button>
                  </li>
                ))}
              </ul>
              <button style={{ marginTop: 4 }} type="button" onClick={() => setSelectedTableId(table.id)}>
                Add Column
              </button>
              {selectedTableId === table.id && (
                <form onSubmit={addColumn} style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={columnName}
                    onChange={e => setColumnName(e.target.value)}
                    placeholder="Column name"
                    required
                  />
                  <input
                    value={columnType}
                    onChange={e => setColumnType(e.target.value)}
                    placeholder="Type"
                    required
                  />
                  <label><input type="checkbox" checked={isPK} onChange={e => setIsPK(e.target.checked)} /> PK</label>
                  <label><input type="checkbox" checked={isFK} onChange={e => setIsFK(e.target.checked)} /> FK</label>
                  <label><input type="checkbox" checked={nullable} onChange={e => setNullable(e.target.checked)} /> Nullable</label>
                  <button type="submit">Add</button>
                  <button type="button" onClick={() => setSelectedTableId(null)}>Cancel</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Relationships section */}
      <div style={{ marginTop: 32 }}>
        <h3>Relationships</h3>
        <form onSubmit={addRelationship} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <select value={sourceTableId} onChange={e => setSourceTableId(e.target.value)} required>
            <option value="">Source Table</option>
            {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={targetTableId} onChange={e => setTargetTableId(e.target.value)} required>
            <option value="">Target Table</option>
            {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={relType} onChange={e => setRelType(e.target.value as '1:N' | 'N:M')}>
            <option value="1:N">1:N</option>
            <option value="N:M">N:M</option>
          </select>
          <input
            value={fkColumn}
            onChange={e => setFKColumn(e.target.value)}
            placeholder="FK Column"
            required
          />
          <button type="submit">Add Relationship</button>
        </form>
        <ul>
          {relationships.map(rel => {
            const source = tables.find(t => t.id === rel.sourceTableId)?.name || rel.sourceTableId;
            const target = tables.find(t => t.id === rel.targetTableId)?.name || rel.targetTableId;
            return (
              <li key={rel.id}>
                {source} → {target} ({rel.type}, FK: {rel.fkColumn})
                <button style={{ marginLeft: 8 }} onClick={() => deleteRelationship(rel.id)} type="button">Delete</button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// SVG icon components
const IconButton = ({ onClick, title, children, style = {}, inputProps }: any) => (
  <span style={{ display: 'inline-block', marginRight: 8, ...style }}>
    <button
      onClick={onClick}
      title={title}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, margin: 0, outline: 'none' }}
      {...inputProps}
    >
      {children}
    </button>
  </span>
);
const DownloadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21V9m0 0l4 4m-4-4l-4 4M4 3h16" stroke="#388e3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#1976d2" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#1976d2"/><path d="M21 15l-5-5L5 21" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/></svg>
);
const SQLIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="#1976d2" strokeWidth="2"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="#1976d2" strokeWidth="2"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" stroke="#1976d2" strokeWidth="2"/></svg>
);
const ExcelIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#388e3c" strokeWidth="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#388e3c" strokeWidth="2"/></svg>
);
const SaveIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="#1976d2" strokeWidth="2"/><path d="M17 21v-8H7v8" stroke="#1976d2" strokeWidth="2"/><path d="M7 3v5h8V3" stroke="#1976d2" strokeWidth="2"/></svg>
);

const DatabricksIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM4 8.5L12 12l8-3.5V7L12 10.5 4 7v1.5z" fill="#FF3621"/>
    <path d="M12 14l-8-3.5V7L12 10.5 20 7v3.5L12 14z" fill="#FF3621"/>
  </svg>
);

function AddTableModal({ open, onClose, onSubmit }: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (name: string, type: 'fact' | 'dimension', scdType: 'none' | 'SCD1' | 'SCD2' | 'SCD3') => void; 
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'fact' | 'dimension'>('fact');
  const [scdType, setSCDType] = useState<'none' | 'SCD1' | 'SCD2' | 'SCD3'>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, type, scdType);
      setName('');
      setType('fact');
      setSCDType('none');
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
        <h3 style={{ marginTop: 0 }}>Add Table</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name: </label>
            <input value={name} onChange={e => setName(e.target.value)} required style={{ marginLeft: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Type: </label>
            <select value={type} onChange={e => setType(e.target.value as 'fact' | 'dimension')} style={{ marginLeft: 8 }}>
              <option value="fact">Fact</option>
              <option value="dimension">Dimension</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>SCD Type: </label>
            <select value={scdType} onChange={e => setSCDType(e.target.value as any)} style={{ marginLeft: 8 }}>
              <option value="none">No SCD</option>
              <option value="SCD1">SCD1</option>
              <option value="SCD2">SCD2</option>
              <option value="SCD3">SCD3</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '4px 12px' }}>Cancel</button>
            <button type="submit" style={{ padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DiagramPage({ tables, relationships, onDeleteTable, onNodePositionChange, onAddColumn, onDeleteColumn, onAddRelationship, onRenameTable, onRenameColumn, onAddTable, onLoad, projectName, onRenameProject, groups, setGroups, globalGroups, setGlobalGroups, projects, currentProjectId }: { tables: TableConfig[]; relationships: RelationshipConfig[]; onDeleteTable: (id: string) => void; onNodePositionChange: (id: string, pos: { x: number; y: number }) => void; onAddColumn: (tableId: string, colName: string) => void; onDeleteColumn: (tableId: string, colIdx: number) => void; onAddRelationship: (sourceId: string, targetId: string, relType: '1:N' | 'N:M', sourceCol: string, targetCol: string) => void; onRenameTable: (tableId: string, newName: string) => void; onRenameColumn: (tableId: string, colIdx: number, newName: string) => void; onAddTable: (name: string, type: 'fact' | 'dimension', scdType: 'none' | 'SCD1' | 'SCD2' | 'SCD3') => void; onLoad: (data: { tables: TableConfig[]; relationships: RelationshipConfig[]; groups: Group[] }) => void; projectName: string; onRenameProject: (newName: string) => void; groups: Group[]; setGroups: (groups: Group[]) => void; globalGroups: GlobalGroup[]; setGlobalGroups: (groups: GlobalGroup[]) => void; projects: Project[]; currentProjectId: string; }) {
  const diagramRef = useRef<HTMLDivElement>(null);

  // Editable project name
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);
  const [hoverName, setHoverName] = useState(false);
  useEffect(() => { setNameInput(projectName); }, [projectName]);

  // Helper to sanitize file names
  const safeFileName = (name: string, ext: string) =>
    name.replace(/[^a-z0-9\-_]+/gi, '_').replace(/^_+|_+$/g, '') + ext;

  // Export as PNG
  const handleExportPNG = async () => {
    if (diagramRef.current) {
      const canvas = await html2canvas(diagramRef.current.querySelector('.react-flow__viewport') as HTMLElement);
      const link = document.createElement('a');
      link.download = safeFileName(projectName, '.png');
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const data = JSON.stringify({ tables, relationships, groups, globalGroups }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = safeFileName(projectName, '.json');
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // Export as SQL (basic DDL)
  const handleExportSQL = () => {
    // Databricks SQL type mapping
    const mapToDatabricksType = (type: string): string => {
      const typeMap: { [key: string]: string } = {
        'string': 'STRING',
        'text': 'STRING',
        'varchar': 'STRING',
        'char': 'STRING',
        'int': 'INT',
        'integer': 'INT',
        'bigint': 'BIGINT',
        'long': 'BIGINT',
        'double': 'DOUBLE',
        'float': 'DOUBLE',
        'decimal': 'DECIMAL(10,2)',
        'boolean': 'BOOLEAN',
        'bool': 'BOOLEAN',
        'date': 'DATE',
        'timestamp': 'TIMESTAMP',
        'datetime': 'TIMESTAMP',
        'array': 'ARRAY<STRING>',
        'map': 'MAP<STRING, STRING>',
        'struct': 'STRUCT<field: STRING>'
      };
      return typeMap[type.toLowerCase()] || 'STRING';
    };

    let sql = '-- Databricks SQL Export\n';
    sql += '-- Generated by ER Diagram Builder\n\n';
    
    tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      sql += table.columns.map(col => 
        `  ${col.name} ${mapToDatabricksType(col.type)}${col.nullable ? '' : ' NOT NULL'}${col.isPK ? ' PRIMARY KEY' : ''}`
      ).join(',\n');
      sql += '\n) USING DELTA;\n\n';
    });
    
    // Add foreign key constraints (Databricks supports these)
    relationships.forEach(rel => {
      const source = tables.find(t => t.id === rel.sourceTableId)?.name;
      const target = tables.find(t => t.id === rel.targetTableId)?.name;
      if (source && target) {
        sql += `-- Foreign Key Relationship\n`;
        sql += `ALTER TABLE ${target} ADD CONSTRAINT fk_${rel.fkColumn} FOREIGN KEY (${rel.fkColumn}) REFERENCES ${source}(${rel.fkColumn});\n\n`;
      }
    });
    
    const blob = new Blob([sql], { type: 'text/sql' });
    const link = document.createElement('a');
    link.download = safeFileName(projectName, '.sql');
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.tables && data.relationships) {
          onLoad(data);
          if (data.globalGroups) setGlobalGroups(data.globalGroups);
        } else {
          alert('Invalid file format.');
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Import Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const workbook = XLSX.read(evt.target?.result, { type: 'binary' });
        const tablesSheet = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Tables'] || workbook.Sheets[workbook.SheetNames[0]]);
        const columnsSheet = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Columns'] || workbook.Sheets[workbook.SheetNames[1]]);
        const relsSheet = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Relationships'] || workbook.Sheets[workbook.SheetNames[2]]);
        const globalGroupsSheet = workbook.Sheets['GlobalGroups'] ? XLSX.utils.sheet_to_json<any>(workbook.Sheets['GlobalGroups']) : [];
        // Collect group names and memberships
        const groupMap: { [name: string]: string[] } = {};
        // Map tables
        const tables: TableConfig[] = tablesSheet.map((row: any) => {
          const id = String(row.id ?? row.ID ?? row.Name);
          const groupNames = (row.groups ?? row.Groups ?? '').split(',').map((g: string) => g.trim()).filter(Boolean);
          groupNames.forEach((g: string) => {
            if (!groupMap[g]) groupMap[g] = [];
            groupMap[g].push(id);
          });
          return {
            id,
            name: row.name ?? row.Name,
            type: (row.type ?? row.Type ?? 'fact').toLowerCase() as 'fact' | 'dimension',
            scdType: row.scdType ?? row.SCDType ?? 'none',
            columns: [],
            position: row.positionX && row.positionY ? { x: Number(row.positionX), y: Number(row.positionY) } : undefined,
          };
        });
        // Map columns
        columnsSheet.forEach((row: any) => {
          const tableId = String(row.tableId ?? row.TableId ?? row.TableID ?? row.Table);
          const table = tables.find(t => t.id === tableId || t.name === tableId);
          if (table) {
            table.columns.push({
              name: row.name ?? row.Name,
              type: row.type ?? row.Type ?? 'string',
              isPK: Boolean(row.isPK ?? row.PK),
              isFK: Boolean(row.isFK ?? row.FK),
              nullable: Boolean(row.nullable ?? row.Nullable),
            });
          }
        });
        // Map relationships (use table names)
        const relationships: RelationshipConfig[] = relsSheet.map((row: any) => {
          const sourceName = row.sourceTable ?? row.SourceTable ?? row.Source;
          const targetName = row.targetTable ?? row.TargetTable ?? row.Target;
          const sourceTable = tables.find(t => t.name === sourceName || t.id === sourceName);
          const targetTable = tables.find(t => t.name === targetName || t.id === targetName);
          return {
            id: String(row.id ?? row.ID ?? `${sourceTable?.id}-${targetTable?.id}`),
            sourceTableId: sourceTable?.id ?? '',
            targetTableId: targetTable?.id ?? '',
            type: row.type ?? row.Type ?? '1:N',
            fkColumn: row.fkColumn ?? row.FKColumn ?? row.FK,
          };
        }).filter(r => r.sourceTableId && r.targetTableId);
        // Build groups array
        const groups: Group[] = Object.entries(groupMap).map(([name, tableIds]) => ({
          id: name.toLowerCase().replace(/[^a-z0-9\-_]+/gi, '_'),
          name,
          tableIds,
        }));
        // Parse global groups
        const globalGroups: GlobalGroup[] = (globalGroupsSheet as any[]).map(row => ({
          id: String(row.id ?? row.ID ?? row.Name),
          name: row.name ?? row.Name,
          tableRefs: (row.tableRefs ?? row.TableRefs ?? '').split(',').map((ref: string) => {
            const [projectId, tableId] = ref.trim().split(':');
            return projectId && tableId ? { projectId, tableId } : null;
          }).filter(Boolean),
        }));
        onLoad({ tables, relationships, groups });
        setGlobalGroups(globalGroups);
      } catch {
        alert('Invalid Excel file or format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export as Excel
  const handleExportExcel = () => {
    // Build a map of tableId -> group names
    const tableGroups: { [id: string]: string[] } = {};
    groups.forEach(g => g.tableIds.forEach(id => {
      if (!tableGroups[id]) tableGroups[id] = [];
      tableGroups[id].push(g.name);
    }));
    const tablesSheet = tables.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      scdType: t.scdType,
      positionX: t.position?.x ?? '',
      positionY: t.position?.y ?? '',
      groups: (tableGroups[t.id] || []).join(', '),
    }));
    const columnsSheet = tables.flatMap(t =>
      t.columns.map(col => ({
        tableId: t.id,
        name: col.name,
        type: col.type,
        isPK: col.isPK ? 1 : 0,
        isFK: col.isFK ? 1 : 0,
        nullable: col.nullable ? 1 : 0,
      }))
    );
    const relsSheet = relationships.map(r => {
      const sourceTable = tables.find(t => t.id === r.sourceTableId);
      const targetTable = tables.find(t => t.id === r.targetTableId);
      return {
        id: r.id,
        sourceTable: sourceTable?.name ?? r.sourceTableId,
        targetTable: targetTable?.name ?? r.targetTableId,
        type: r.type,
        fkColumn: r.fkColumn,
      };
    });
    // GlobalGroups sheet
    const globalGroupsSheet = globalGroups.map(g => ({
      id: g.id,
      name: g.name,
      tableRefs: g.tableRefs.map(ref => `${ref.projectId}:${ref.tableId}`).join(', '),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tablesSheet), 'Tables');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(columnsSheet), 'Columns');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(relsSheet), 'Relationships');
    if (globalGroupsSheet.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalGroupsSheet), 'GlobalGroups');
    }
    XLSX.writeFile(wb, safeFileName(projectName, '-export.xlsx'));
  };

  // Import Databricks SQL
  const handleImportDatabricksSQL = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const sqlContent = evt.target?.result as string;
        
        // Parse SQL to extract table definitions
        const tables: TableConfig[] = [];
        const relationships: RelationshipConfig[] = [];
        
        // Split by CREATE TABLE statements
        const createTableRegex = /CREATE\s+(?:TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)\s*\(([\s\S]*?)\)\s*(?:USING\s+[^\s]+)?\s*(?:AS\s+SELECT\s+[\s\S]*)?;?/gi;
        let match;
        
        while ((match = createTableRegex.exec(sqlContent)) !== null) {
          const tableName = match[1].replace(/[`"]/g, ''); // Remove backticks/quotes
          const columnDefinitions = match[2];
          
          const columns: ColumnConfig[] = [];
          const columnLines = columnDefinitions.split(',').map(line => line.trim()).filter(line => line.length > 0);
          
          columnLines.forEach(line => {
            // Skip constraints and other non-column definitions
            if (line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || 
                line.startsWith('CONSTRAINT') || line.startsWith('INDEX') || 
                line.startsWith('UNIQUE') || line.startsWith('CHECK')) {
              return;
            }
            
            // Parse column definition: column_name data_type [constraints]
            const columnMatch = line.match(/^([^\s]+)\s+([^\s]+)(?:\s+(.+))?$/);
            if (columnMatch) {
              const columnName = columnMatch[1].replace(/[`"]/g, '');
              const dataType = columnMatch[2].toUpperCase();
              const constraints = columnMatch[3] || '';
              
              columns.push({
                name: columnName,
                type: dataType,
                isPK: constraints.includes('PRIMARY KEY') || constraints.includes('NOT NULL') && columnName.toLowerCase().includes('id'),
                isFK: constraints.includes('FOREIGN KEY') || columnName.toLowerCase().includes('_id'),
                nullable: !constraints.includes('NOT NULL'),
              });
            }
          });
          
          if (columns.length > 0) {
            tables.push({
              id: tableName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
              name: tableName,
              type: 'dimension', // Default to dimension, can be refined later
              scdType: 'none',
              columns,
              position: { x: 100 + (tables.length % 4) * 250, y: 50 + Math.floor(tables.length / 4) * 200 },
            });
          }
        }
        
        // Try to extract relationships from FOREIGN KEY constraints
        const fkRegex = /FOREIGN\s+KEY\s*\(\s*([^)]+)\s*\)\s+REFERENCES\s+([^\s(]+)\s*\(\s*([^)]+)\s*\)/gi;
        let fkMatch;
        
        while ((fkMatch = fkRegex.exec(sqlContent)) !== null) {
          const fkColumn = fkMatch[1].replace(/[`"]/g, '');
          const referencedTable = fkMatch[2].replace(/[`"]/g, '');
          const referencedColumn = fkMatch[3].replace(/[`"]/g, '');
          
          // Find the tables involved
          const sourceTable = tables.find(t => t.columns.some(c => c.name === fkColumn));
          const targetTable = tables.find(t => t.name === referencedTable);
          
          if (sourceTable && targetTable) {
            relationships.push({
              id: `${sourceTable.id}-${targetTable.id}`,
              sourceTableId: sourceTable.id,
              targetTableId: targetTable.id,
              type: '1:N',
              fkColumn,
            });
          }
        }
        
        if (tables.length > 0) {
          onLoad({ tables, relationships, groups: [] });
          alert(`Successfully imported ${tables.length} tables and ${relationships.length} relationships from Databricks SQL.`);
        } else {
          alert('No valid table definitions found in the SQL file.');
        }
      } catch (error) {
        console.error('Error parsing Databricks SQL:', error);
        alert('Error parsing Databricks SQL file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // --- GROUP MODE STATE ---
  const [groupMode, setGroupMode] = useState(false);
  const [groupType, setGroupType] = useState<'local' | 'global'>('local');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedGlobalTables, setSelectedGlobalTables] = useState<{ projectId: string; tableId: string }[]>([]);
  const [activeGroupIds, setActiveGroupIds] = useState<string[]>([]); // toggled group buttons
  const [activeGlobalGroupIds, setActiveGlobalGroupIds] = useState<string[]>([]);
  const [groupModal, setGroupModal] = useState<{ open: boolean; groupId?: string; global?: boolean }>({ open: false });
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupEditTables, setGroupEditTables] = useState<string[]>([]);
  const [groupEditGlobalTables, setGroupEditGlobalTables] = useState<{ projectId: string; tableId: string }[]>([]);
  const [globalProjectTab, setGlobalProjectTab] = useState(currentProjectId);
  // --- END GROUP MODE STATE ---

  // --- IMPORT/EXPORT TABS STATE ---
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  // --- END IMPORT/EXPORT TABS STATE ---

  // --- ADD TABLE MODAL STATE ---
  const [addTableOpen, setAddTableOpen] = useState(false);
  // --- END ADD TABLE MODAL STATE ---

  // --- GROUP MODE HANDLERS ---
  const handleToggleGroupMode = () => {
    setGroupMode(g => !g);
    setGroupType('local');
    setSelectedTables([]);
    setSelectedGlobalTables([]);
  };
  const handleTableClick = (tableId: string) => {
    if (!groupMode || groupType !== 'local') return;
    setSelectedTables(sel => sel.includes(tableId) ? sel.filter(id => id !== tableId) : [...sel, tableId]);
  };
  const handleGlobalTableClick = (projectId: string, tableId: string) => {
    if (!groupMode || groupType !== 'global') return;
    const key = `${projectId}__${tableId}`;
    setSelectedGlobalTables(sel =>
      sel.some(t => t.projectId === projectId && t.tableId === tableId)
        ? sel.filter(t => !(t.projectId === projectId && t.tableId === tableId))
        : [...sel, { projectId, tableId }]
    );
  };
  const handleCreateGroup = () => {
    if (groupType === 'local') {
      if (!groupNameInput.trim() || selectedTables.length === 0) return;
      setGroups([
        ...groups,
        {
          id: groupNameInput.trim().toLowerCase().replace(/[^a-z0-9\-_]+/gi, '_'),
          name: groupNameInput.trim(),
          tableIds: selectedTables,
        },
      ]);
    } else {
      if (!groupNameInput.trim() || selectedGlobalTables.length === 0) return;
      setGlobalGroups([
        ...globalGroups,
        {
          id: groupNameInput.trim().toLowerCase().replace(/[^a-z0-9\-_]+/gi, '_'),
          name: groupNameInput.trim(),
          tableRefs: selectedGlobalTables,
        },
      ]);
    }
    setGroupNameInput('');
    setSelectedTables([]);
    setSelectedGlobalTables([]);
    setGroupMode(false);
  };
  const handleToggleGroup = (groupId: string) => {
    setActiveGroupIds(ids => ids.includes(groupId) ? ids.filter(id => id !== groupId) : [...ids, groupId]);
  };
  const handleToggleGlobalGroup = (groupId: string) => {
    setActiveGlobalGroupIds(ids => ids.includes(groupId) ? ids.filter(id => id !== groupId) : [...ids, groupId]);
  };
  const handleOpenGroupModal = (groupId: string, global: boolean = false) => {
    if (global) {
      const group = globalGroups.find(g => g.id === groupId);
      setGroupModal({ open: true, groupId, global: true });
      setGroupNameInput(group?.name || '');
      setGroupEditGlobalTables(group?.tableRefs || []);
      setGlobalProjectTab(currentProjectId);
    } else {
      const group = groups.find(g => g.id === groupId);
      setGroupModal({ open: true, groupId, global: false });
      setGroupNameInput(group?.name || '');
      setGroupEditTables(group?.tableIds || []);
    }
  };
  const handleCloseGroupModal = () => {
    setGroupModal({ open: false });
    setGroupNameInput('');
    setGroupEditTables([]);
    setGroupEditGlobalTables([]);
  };
  const handleSaveGroupEdit = () => {
    if (groupModal.global) {
      setGlobalGroups(globalGroups.map(g => g.id === groupModal.groupId ? { ...g, name: groupNameInput.trim(), tableRefs: groupEditGlobalTables } : g));
    } else {
      setGroups(groups.map(g => g.id === groupModal.groupId ? { ...g, name: groupNameInput.trim(), tableIds: groupEditTables } : g));
    }
    handleCloseGroupModal();
  };
  const handleDeleteGroup = () => {
    if (groupModal.global) {
      setGlobalGroups(globalGroups.filter(g => g.id !== groupModal.groupId));
      setActiveGlobalGroupIds(ids => ids.filter(id => id !== groupModal.groupId));
    } else {
      setGroups(groups.filter(g => g.id !== groupModal.groupId));
      setActiveGroupIds(ids => ids.filter(id => id !== groupModal.groupId));
    }
    handleCloseGroupModal();
  };
  // --- END GROUP MODE HANDLERS ---

  // --- GROUP HIGHLIGHTING LOGIC ---
  const highlightedTableIds = activeGroupIds.length > 0
    ? Array.from(new Set(activeGroupIds.flatMap(id => groups.find(g => g.id === id)?.tableIds || [])))
    : null;
  const highlightedGlobalTableIds = activeGlobalGroupIds.length > 0
    ? Array.from(new Set(activeGlobalGroupIds.flatMap(id =>
        globalGroups.find(g => g.id === id)?.tableRefs.filter(ref => ref.projectId === currentProjectId).map(ref => ref.tableId) || []
      )))
    : null;
  // --- END GROUP HIGHLIGHTING LOGIC ---

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        {editingName ? (
          <form
            onSubmit={e => { e.preventDefault(); onRenameProject(nameInput); setEditingName(false); }}
            style={{ flex: 1 }}
          >
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
              onBlur={() => { onRenameProject(nameInput); setEditingName(false); }}
              style={{ fontSize: 28, fontWeight: 700, color: '#c00', border: '1px solid #bbb', borderRadius: 4, padding: '2px 8px', width: '60%' }}
            />
          </form>
        ) : (
          <span
            style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#c00', flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onMouseEnter={() => setHoverName(true)}
            onMouseLeave={() => setHoverName(false)}
            onClick={() => setEditingName(true)}
          >
            {projectName}
            {hoverName && (
              <span style={{ marginLeft: 8 }} title="Rename diagram">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.5 9.5-4 1 1-4 9.5-9.5Zm2.12 2.12-1.06-1.06a1.121 1.121 0 0 0-1.59 0l-9.5 9.5a1 1 0 0 0-.26.46l-1 4a1 1 0 0 0 1.22 1.22l4-1a1 1 0 0 0 .46-.26l9.5-9.5a1.121 1.121 0 0 0 0-1.59Z" fill="#1976d2"/></svg>
              </span>
            )}
          </span>
        )}
        {/* Import/Export Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 8, padding: 4, marginLeft: 16 }}>
          <button
            onClick={() => setActiveTab('export')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: activeTab === 'export' ? '#1976d2' : 'transparent',
              color: activeTab === 'export' ? '#fff' : '#666',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: activeTab === 'import' ? '#1976d2' : 'transparent',
              color: activeTab === 'import' ? '#fff' : '#666',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            Import
          </button>
        </div>
        
        {/* Export/Import Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
          {activeTab === 'export' ? (
            <>
              <IconButton onClick={handleExportPNG} title="Export as PNG"><ImageIcon /></IconButton>
              <IconButton onClick={handleExportSQL} title="Export as SQL"><SQLIcon /></IconButton>
              <IconButton onClick={handleExportJSON} title="Save as JSON"><SaveIcon /></IconButton>
              <IconButton onClick={handleExportExcel} title="Export as Excel"><DownloadIcon /></IconButton>
            </>
          ) : (
            <>
              <label title="Import JSON" style={{ display: 'inline-block', cursor: 'pointer' }}>
                <UploadIcon />
                <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportJSON} />
              </label>
              <label title="Import Excel" style={{ display: 'inline-block', cursor: 'pointer' }}>
                <ExcelIcon />
                <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportExcel} />
              </label>
              <label title="Import Databricks SQL" style={{ display: 'inline-block', cursor: 'pointer' }}>
                <DatabricksIcon />
                <input type="file" accept=".sql" style={{ display: 'none' }} onChange={handleImportDatabricksSQL} />
              </label>
            </>
          )}
        </div>
        <button
          style={{
            marginLeft: 16,
            background: groupMode ? '#1976d2' : '#eee',
            color: groupMode ? '#fff' : '#1976d2',
            border: 'none',
            borderRadius: 6,
            padding: '6px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
          }}
          onClick={handleToggleGroupMode}
          title="Toggle Data Products mode"
        >
          {groupMode ? 'Exit Data Products' : 'Data Products'}
        </button>
        <button
          style={{
            marginLeft: 16,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={() => setAddTableOpen(true)}
          title="Add new table"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
          </svg>
          Add Table
        </button>
      </div>
      {/* DATA PRODUCT BUTTONS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* Local data products */}
        {groups.map(group => (
          <div key={group.id} style={{ display: 'flex', alignItems: 'center', background: activeGroupIds.includes(group.id) ? '#1976d2' : '#eee', color: activeGroupIds.includes(group.id) ? '#fff' : '#1976d2', borderRadius: 6, padding: '4px 10px', fontWeight: 600, cursor: 'pointer' }}>
            <span onClick={() => handleToggleGroup(group.id)}>{group.name}</span>
            <span style={{ marginLeft: 6, cursor: 'pointer' }} title="Data Product settings" onClick={() => handleOpenGroupModal(group.id, false)}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#888" strokeWidth="2"/><path d="M10 6v4l3 2" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
          </div>
        ))}
        {/* Global data products */}
        {globalGroups.map(group => (
          <div key={group.id} style={{ display: 'flex', alignItems: 'center', background: activeGlobalGroupIds.includes(group.id) ? '#1976d2' : '#eee', color: activeGlobalGroupIds.includes(group.id) ? '#fff' : '#1976d2', borderRadius: 6, padding: '4px 10px', fontWeight: 600, cursor: 'pointer' }}>
            <span onClick={() => handleToggleGlobalGroup(group.id)}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ marginRight: 4, verticalAlign: 'middle' }}><circle cx="10" cy="10" r="8" stroke="#1976d2" strokeWidth="2" fill="#fff"/><path d="M10 2a8 8 0 0 1 0 16M2 10a8 8 0 0 1 16 0" stroke="#1976d2" strokeWidth="1.5"/><ellipse cx="10" cy="10" rx="3.5" ry="8" stroke="#1976d2" strokeWidth="1.5"/></svg>
              {group.name}
            </span>
            <span style={{ marginLeft: 6, cursor: 'pointer' }} title="Global Data Product settings" onClick={() => handleOpenGroupModal(group.id, true)}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#888" strokeWidth="2"/><path d="M10 6v4l3 2" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
          </div>
        ))}
      </div>
      {/* DATA PRODUCTS MODE UI */}
      {groupMode && (
        <div style={{ background: '#e3f2fd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Create a Data Product:</div>
          <div style={{ marginBottom: 12 }}>
            <label>
              <input type="radio" checked={groupType === 'local'} onChange={() => setGroupType('local')} /> Local Data Product
            </label>
            <label style={{ marginLeft: 18 }}>
              <input type="radio" checked={groupType === 'global'} onChange={() => setGroupType('global')} /> Global Data Product
            </label>
          </div>
          {groupType === 'local' ? (
            <>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Select tables for Data Product (this project):</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {tables.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleTableClick(t.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      background: selectedTables.includes(t.id) ? '#1976d2' : '#fff',
                      color: selectedTables.includes(t.id) ? '#fff' : '#1976d2',
                      border: '1.5px solid #1976d2',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                  >
                    {t.name}
                  </div>
                ))}
              </div>
            </>
                      ) : (
            <>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Select tables for Data Product (any project):</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setGlobalProjectTab(p.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      background: globalProjectTab === p.id ? '#1976d2' : '#fff',
                      color: globalProjectTab === p.id ? '#fff' : '#1976d2',
                      border: '1.5px solid #1976d2',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {projects.find(p => p.id === globalProjectTab)?.tables.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleGlobalTableClick(globalProjectTab, t.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      background: selectedGlobalTables.some(sel => sel.projectId === globalProjectTab && sel.tableId === t.id) ? '#1976d2' : '#fff',
                      color: selectedGlobalTables.some(sel => sel.projectId === globalProjectTab && sel.tableId === t.id) ? '#fff' : '#1976d2',
                      border: '1.5px solid #1976d2',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                  >
                    {t.name}
                  </div>
                ))}
              </div>
            </>
          )}
          <input
            value={groupNameInput}
            onChange={e => setGroupNameInput(e.target.value)}
            placeholder="Data Product name"
            style={{ fontSize: 15, padding: '4px 10px', borderRadius: 4, border: '1px solid #bbb', marginRight: 8 }}
          />
          <button
            onClick={handleCreateGroup}
            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15 }}
            disabled={groupType === 'local' ? (!groupNameInput.trim() || selectedTables.length === 0) : (!groupNameInput.trim() || selectedGlobalTables.length === 0)}
          >
            Create Data Product
          </button>
        </div>
      )}
      {/* DATA PRODUCT MANAGEMENT MODAL */}
      {groupModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 340, boxShadow: '0 2px 16px #0002' }}>
            <h3 style={{ marginTop: 0 }}>{groupModal.global ? 'Edit Global Data Product' : 'Edit Data Product'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Data Product Name: </label>
              <input value={groupNameInput} onChange={e => setGroupNameInput(e.target.value)} style={{ marginLeft: 8 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Tables: </label>
              {groupModal.global ? (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setGlobalProjectTab(p.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          background: globalProjectTab === p.id ? '#1976d2' : '#fff',
                          color: globalProjectTab === p.id ? '#fff' : '#1976d2',
                          border: '1.5px solid #1976d2',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginBottom: 4,
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {projects.find(p => p.id === globalProjectTab)?.tables.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setGroupEditGlobalTables(sel =>
                          sel.some(ref => ref.projectId === globalProjectTab && ref.tableId === t.id)
                            ? sel.filter(ref => !(ref.projectId === globalProjectTab && ref.tableId === t.id))
                            : [...sel, { projectId: globalProjectTab, tableId: t.id }]
                        )}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 6,
                          background: groupEditGlobalTables.some(ref => ref.projectId === globalProjectTab && ref.tableId === t.id) ? '#1976d2' : '#fff',
                          color: groupEditGlobalTables.some(ref => ref.projectId === globalProjectTab && ref.tableId === t.id) ? '#fff' : '#1976d2',
                          border: '1.5px solid #1976d2',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginBottom: 4,
                        }}
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {tables.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setGroupEditTables(ids => ids.includes(t.id) ? ids.filter(id => id !== t.id) : [...ids, t.id])}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        background: groupEditTables.includes(t.id) ? '#1976d2' : '#fff',
                        color: groupEditTables.includes(t.id) ? '#fff' : '#1976d2',
                        border: '1.5px solid #1976d2',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: 4,
                      }}
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={handleCloseGroupModal} style={{ padding: '4px 12px' }}>Cancel</button>
              <button onClick={handleSaveGroupEdit} style={{ padding: '4px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Save</button>
              <button onClick={handleDeleteGroup} style={{ padding: '4px 12px', background: '#c00', color: '#fff', border: 'none', borderRadius: 4 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* DIAGRAM CANVAS */}
      <div ref={diagramRef}>
        <DiagramBuilder
          tables={tables}
          relationships={relationships}
          onDeleteTable={onDeleteTable}
          onNodePositionChange={onNodePositionChange}
          onAddColumn={onAddColumn}
          onDeleteColumn={onDeleteColumn}
          onAddRelationship={onAddRelationship}
          onRenameTable={onRenameTable}
          onRenameColumn={onRenameColumn}
          onAddTable={onAddTable}
          groupMode={groupMode}
          onTableSelect={handleTableClick}
          highlightedTableIds={highlightedTableIds || highlightedGlobalTableIds}
          addTableOpen={addTableOpen}
          onAddTableOpen={setAddTableOpen}
        />
      </div>
      
      {/* ADD TABLE MODAL */}
      <AddTableModal
        open={addTableOpen}
        onClose={() => setAddTableOpen(false)}
        onSubmit={(name, type, scdType) => {
          onAddTable(name, type, scdType);
          setAddTableOpen(false);
        }}
      />
    </div>
  );
}

function App() {
  // Multi-project state
  const [projects, setProjects] = useState<Project[]>([{
    id: '1',
    name: 'New Diagram',
    tables: [],
    relationships: [],
    groups: [],
  }]);
  const [selectedProjectId, setSelectedProjectId] = useState('1');
  // Global groups state
  const [globalGroups, setGlobalGroups] = useState<GlobalGroup[]>([]);

  // Get current project
  const project = projects.find(p => p.id === selectedProjectId) ?? projects[0];
  const setProjectData = (tables: TableConfig[], relationships: RelationshipConfig[], groups: Group[] = project.groups) => {
    setProjects(ps => ps.map(p => p.id === project.id ? { ...p, tables, relationships, groups } : p));
  };

  // All handlers now operate on the selected project
  const handleDeleteTable = (id: string) => {
    setProjectData(
      project.tables.filter(t => t.id !== id),
      project.relationships.filter(r => r.sourceTableId !== id && r.targetTableId !== id)
    );
  };
  const handleNodePositionChange = (id: string, pos: { x: number; y: number }) => {
    setProjectData(
      project.tables.map(t => t.id === id ? { ...t, position: pos } : t),
      project.relationships
    );
  };
  const handleAddColumn = (tableId: string, colName: string) => {
    setProjectData(
      project.tables.map(t =>
        t.id === tableId
          ? { ...t, columns: [...t.columns, { name: colName, type: 'string' }] }
          : t
      ),
      project.relationships
    );
  };
  const handleDeleteColumn = (tableId: string, colIdx: number) => {
    setProjectData(
      project.tables.map(t =>
        t.id === tableId
          ? { ...t, columns: t.columns.filter((_, i) => i !== colIdx) }
          : t
      ),
      project.relationships
    );
  };
  const handleAddRelationship = (sourceId: string, targetId: string, relType: '1:N' | 'N:M', sourceCol: string, targetCol: string) => {
    setProjectData(
      project.tables,
      [
        ...project.relationships,
        {
          id: Date.now().toString(),
          sourceTableId: sourceId,
          targetTableId: targetId,
          type: relType,
          fkColumn: targetCol,
        },
      ]
    );
  };
  const handleRenameTable = (tableId: string, newName: string) => {
    setProjectData(
      project.tables.map(t => t.id === tableId ? { ...t, name: newName } : t),
      project.relationships
    );
  };
  const handleRenameColumn = (tableId: string, colIdx: number, newName: string) => {
    setProjectData(
      project.tables.map(t =>
        t.id === tableId
          ? { ...t, columns: t.columns.map((col, i) => i === colIdx ? { ...col, name: newName } : col) }
          : t
      ),
      project.relationships
    );
  };
  const handleAddTable = (name: string, type: 'fact' | 'dimension', scdType: 'none' | 'SCD1' | 'SCD2' | 'SCD3') => {
    setProjectData(
      [
        ...project.tables,
        {
          id: Date.now().toString(),
          name,
          type,
          scdType,
          columns: [],
          position: { x: 100 + (project.tables.length % 4) * 250, y: 50 + Math.floor(project.tables.length / 4) * 200 },
        },
      ],
      project.relationships
    );
  };
  const handleLoad = (data: { tables: TableConfig[]; relationships: RelationshipConfig[] }) => {
    setProjectData(data.tables, data.relationships);
  };

  // Add new project
  const handleAddProject = () => {
    const newId = Date.now().toString();
    setProjects(ps => [...ps, { id: newId, name: `New Diagram ${ps.length + 1}`, tables: [], relationships: [], groups: [] }]);
    setSelectedProjectId(newId);
  };
  // Rename project
  const handleRenameProject = (id: string, newName: string) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  // Add this function in App
  const setGroupsForProject = (groups: Group[]) => {
    setProjectData(project.tables, project.relationships, groups);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Project tabs */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e0e0e0', background: '#f7f7f7' }}>
        {projects.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedProjectId(p.id)}
              style={{
                padding: '12px 28px',
                border: 'none',
                borderBottom: selectedProjectId === p.id ? '3px solid #1976d2' : '3px solid transparent',
                background: 'none',
                color: selectedProjectId === p.id ? '#1976d2' : '#444',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                outline: 'none',
                transition: 'color 0.2s',
                marginRight: 2,
              }}
              title={p.name}
            >
              {p.name}
            </button>
          </div>
        ))}
        <button
          onClick={handleAddProject}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            color: '#1976d2',
            fontWeight: 700,
            fontSize: 22,
            cursor: 'pointer',
            outline: 'none',
            marginLeft: 8,
          }}
          title="Add new diagram"
        >
          +
        </button>
      </div>
      {/* Only show the diagram for the selected project */}
      <main style={{ flex: 1, background: '#f7f7f7', minHeight: 0 }}>
        <DiagramPage
          tables={project.tables}
          relationships={project.relationships}
          onDeleteTable={handleDeleteTable}
          onNodePositionChange={handleNodePositionChange}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onAddRelationship={handleAddRelationship}
          onRenameTable={handleRenameTable}
          onRenameColumn={handleRenameColumn}
          onAddTable={handleAddTable}
          onLoad={handleLoad}
          projectName={project.name}
          onRenameProject={newName => handleRenameProject(project.id, newName)}
          groups={project.groups}
          setGroups={setGroupsForProject}
          globalGroups={globalGroups}
          setGlobalGroups={setGlobalGroups}
          projects={projects}
          currentProjectId={project.id}
        />
      </main>
    </div>
  );
}

export default App;
