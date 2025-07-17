import React, { useCallback, useState } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, useNodesState, useEdgesState, NodeProps, OnNodesChange, OnEdgesChange, NodeChange, EdgeChange, Position, Connection, addEdge, Handle, Position as HandlePosition } from 'react-flow-renderer';
import { TableConfig, RelationshipConfig, ColumnConfig } from './App';

const PencilIcon = ({ style = {} }: { style?: React.CSSProperties }) => (
  <svg style={{ width: 14, height: 14, verticalAlign: 'middle', ...style }} viewBox="0 0 20 20" fill="none"><path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.5 9.5-4 1 1-4 9.5-9.5Zm2.12 2.12-1.06-1.06a1.121 1.121 0 0 0-1.59 0l-9.5 9.5a1 1 0 0 0-.26.46l-1 4a1 1 0 0 0 1.22 1.22l4-1a1 1 0 0 0 .46-.26l9.5-9.5a1.121 1.121 0 0 0 0-1.59Z" fill="#888"/></svg>
);

function TableNode({ data, id }: NodeProps) {
  const { table, onDeleteTable, onAddColumn, onDeleteColumn, onRenameTable, onRenameColumn, groupMode, onTableSelect, highlighted = true } = data;
  const [colName, setColName] = React.useState('');
  const [editingTable, setEditingTable] = React.useState(false);
  const [tableName, setTableName] = React.useState(table.name);
  const [editingColIdx, setEditingColIdx] = React.useState<number | null>(null);
  const [colEditName, setColEditName] = React.useState('');
  const [hoverTable, setHoverTable] = React.useState(false);
  const [hoverColIdx, setHoverColIdx] = React.useState<number | null>(null);

  React.useEffect(() => { setTableName(table.name); }, [table.name]);

  return (
    <div
      style={{
        minWidth: 200,
        background: '#fff',
        border: '1.5px solid #bbb',
        borderRadius: 8,
        boxShadow: '0 2px 8px #0001',
        overflow: 'hidden',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        position: 'relative',
        marginLeft: 18,
        marginRight: 18,
        opacity: highlighted ? 1 : 0.25,
        pointerEvents: highlighted ? 'auto' : 'none',
        outline: groupMode && highlighted ? '2px solid #1976d2' : undefined,
        cursor: groupMode ? 'pointer' : undefined,
      }}
      onClick={groupMode && onTableSelect ? (e) => { e.stopPropagation(); onTableSelect(id); } : undefined}
      onMouseEnter={() => setHoverTable(true)}
      onMouseLeave={() => { setHoverTable(false); setHoverColIdx(null); }}
    >
      {/* Target handle (left) */}
      <Handle type="target" position={HandlePosition.Left} style={{ background: '#1976d2', width: 12, height: 12, borderRadius: '50%', top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'all' }} />
      {/* Source handle (right) */}
      <Handle type="source" position={HandlePosition.Right} style={{ background: '#1976d2', width: 12, height: 12, borderRadius: '50%', top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'all' }} />
      <div
        style={{
          background: table.type === 'fact' ? '#e3f2fd' : '#f3e5f5',
          color: '#222',
          padding: '8px 12px',
          fontWeight: 600,
          fontSize: 15,
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
        onMouseEnter={() => setHoverTable(true)}
        onMouseLeave={() => setHoverTable(false)}
      >
        {editingTable ? (
          <form
            onSubmit={e => { e.preventDefault(); onRenameTable(id, tableName); setEditingTable(false); }}
            style={{ flex: 1 }}
          >
            <input
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              autoFocus
              onBlur={() => { onRenameTable(id, tableName); setEditingTable(false); }}
              style={{ fontSize: 15, fontWeight: 600, border: '1px solid #bbb', borderRadius: 4, padding: '2px 6px', width: '90%' }}
            />
          </form>
        ) : (
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span onClick={() => setEditingTable(true)}>{table.name}</span>
            {hoverTable && !editingTable && (
              <span style={{ marginLeft: 6, cursor: 'pointer' }} title="Rename table" onClick={() => setEditingTable(true)}>
                <PencilIcon />
              </span>
            )}
            {hoverTable && !editingTable && (
              <span
                style={{ marginLeft: 10, color: '#c00', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}
                title="Delete table"
                onClick={e => { e.stopPropagation(); onDeleteTable(id); }}
              >
                ×
              </span>
            )}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 400, color: '#666', marginLeft: 8 }}>
          {table.type}, {table.scdType}
        </span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {table.columns.map((col: ColumnConfig, idx: number) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderBottom: idx === table.columns.length - 1 ? 'none' : '1px solid #f0f0f0',
              fontSize: 13,
              position: 'relative',
              background: '#fff',
            }}
            onMouseEnter={() => setHoverColIdx(idx)}
            onMouseLeave={() => setHoverColIdx(null)}
          >
            {editingColIdx === idx ? (
              <form
                onSubmit={e => { e.preventDefault(); onRenameColumn(id, idx, colEditName); setEditingColIdx(null); }}
                style={{ flex: 1 }}
              >
                <input
                  value={colEditName}
                  onChange={e => setColEditName(e.target.value)}
                  autoFocus
                  onBlur={() => { onRenameColumn(id, idx, colEditName); setEditingColIdx(null); }}
                  style={{ fontSize: 13, border: '1px solid #bbb', borderRadius: 4, padding: '2px 6px', width: '90%' }}
                />
              </form>
            ) : (
              <span style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <span onClick={() => { setEditingColIdx(idx); setColEditName(col.name); }}>
                  {col.name}: {col.type}
                  {col.isPK && ' [PK]'}
                  {col.isFK && ' [FK]'}
                  {col.nullable && ' [NULLABLE]'}
                </span>
                {hoverColIdx === idx && editingColIdx !== idx && (
                  <span style={{ marginLeft: 6, cursor: 'pointer', color: '#c00', fontWeight: 'bold', fontSize: 16 }} title="Delete column" onClick={e => { e.stopPropagation(); onDeleteColumn(id, idx); }}>
                    ×
                  </span>
                )}
                {hoverColIdx === idx && editingColIdx !== idx && (
                  <span style={{ marginLeft: 6, cursor: 'pointer' }} title="Rename column" onClick={() => { setEditingColIdx(idx); setColEditName(col.name); }}>
                    <PencilIcon />
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (colName.trim()) {
            onAddColumn(id, colName);
            setColName('');
          }
        }}
        style={{ display: 'flex', padding: '8px 12px', borderTop: '1px solid #eee', background: '#fafafa' }}
      >
        <input
          value={colName}
          onChange={e => setColName(e.target.value)}
          placeholder="Add column"
          style={{ fontSize: 13, flex: 1, border: '1px solid #ccc', borderRadius: 4, padding: '2px 6px', marginRight: 6 }}
        />
        <button type="submit" style={{ fontSize: 13, padding: '2px 10px', borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 500 }}>
          +
        </button>
      </form>
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

function RelationshipModal({
  open,
  sourceTable,
  targetTable,
  onClose,
  onSubmit,
}: {
  open: boolean;
  sourceTable: TableConfig | undefined;
  targetTable: TableConfig | undefined;
  onClose: () => void;
  onSubmit: (relType: '1:N' | 'N:M', sourceCol: string, targetCol: string) => void;
}) {
  const [relType, setRelType] = useState<'1:N' | 'N:M'>('1:N');
  const [sourceCol, setSourceCol] = useState('');
  const [targetCol, setTargetCol] = useState('');

  React.useEffect(() => {
    setSourceCol('');
    setTargetCol('');
    setRelType('1:N');
  }, [open, sourceTable, targetTable]);

  if (!open || !sourceTable || !targetTable) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
        <h3 style={{ marginTop: 0 }}>Configure Relationship</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit(relType, sourceCol, targetCol); }}>
          <div style={{ marginBottom: 12 }}>
            <label>Relationship Type: </label>
            <select value={relType} onChange={e => setRelType(e.target.value as '1:N' | 'N:M')}>
              <option value="1:N">1:N</option>
              <option value="N:M">N:M</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Source Column: </label>
            <select value={sourceCol} onChange={e => setSourceCol(e.target.value)} required>
              <option value="">Select column</option>
              {sourceTable.columns.map(col => <option key={col.name} value={col.name}>{col.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Target Column: </label>
            <select value={targetCol} onChange={e => setTargetCol(e.target.value)} required>
              <option value="">Select column</option>
              {targetTable.columns.map(col => <option key={col.name} value={col.name}>{col.name}</option>)}
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

function AddTableModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (name: string, type: 'fact' | 'dimension', scdType: 'none' | 'SCD1' | 'SCD2' | 'SCD3') => void; }) {
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

function DiagramBuilder({
  tables,
  relationships,
  onDeleteTable,
  onNodePositionChange,
  onAddColumn,
  onDeleteColumn,
  onAddRelationship,
  onRenameTable,
  onRenameColumn,
  onAddTable,
  groupMode = false,
  onTableSelect,
  highlightedTableIds = null,
  addTableOpen = false,
  onAddTableOpen,
}: {
  tables: TableConfig[];
  relationships: RelationshipConfig[];
  onDeleteTable: (id: string) => void;
  onNodePositionChange: (id: string, pos: { x: number; y: number }) => void;
  onAddColumn: (tableId: string, colName: string) => void;
  onDeleteColumn: (tableId: string, colIdx: number) => void;
  onAddRelationship: (sourceId: string, targetId: string, relType: '1:N' | 'N:M', sourceCol: string, targetCol: string) => void;
  onRenameTable: (tableId: string, newName: string) => void;
  onRenameColumn: (tableId: string, colIdx: number, newName: string) => void;
  onAddTable: (name: string, type: 'fact' | 'dimension', scdType: 'none' | 'SCD1' | 'SCD2' | 'SCD3') => void;
  groupMode?: boolean;
  onTableSelect?: (tableId: string) => void;
  highlightedTableIds?: string[] | null;
  addTableOpen?: boolean;
  onAddTableOpen?: (open: boolean) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConn, setPendingConn] = useState<{ source: string; target: string } | null>(null);

  // Use positions from tables, default if missing
  const nodes: Node[] = tables.map((table, idx) => ({
    id: table.id,
    type: 'tableNode',
    data: {
      table,
      onDeleteTable,
      onAddColumn,
      onDeleteColumn,
      onRenameTable,
      onRenameColumn,
      groupMode,
      onTableSelect,
      highlighted: highlightedTableIds ? highlightedTableIds.includes(table.id) : true,
    },
    position: table.position || { x: 100 + (idx % 4) * 250, y: 50 + Math.floor(idx / 4) * 200 },
  }));

  const edges: Edge[] = relationships.map(rel => ({
    id: rel.id,
    source: rel.sourceTableId,
    target: rel.targetTableId,
    animated: true,
    label: `${rel.type}, FK: ${rel.fkColumn}`,
  }));

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        onNodePositionChange(change.id, change.position);
      }
    });
  }, [onNodePositionChange]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      setPendingConn({ source: connection.source, target: connection.target });
      setModalOpen(true);
    }
  }, []);

  const handleModalSubmit = (relType: '1:N' | 'N:M', sourceCol: string, targetCol: string) => {
    if (pendingConn) {
      onAddRelationship(pendingConn.source, pendingConn.target, relType, sourceCol, targetCol);
      setModalOpen(false);
      setPendingConn(null);
    }
  };

  return (
    <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <RelationshipModal
        open={modalOpen}
        sourceTable={tables.find(t => t.id === pendingConn?.source)}
        targetTable={tables.find(t => t.id === pendingConn?.target)}
        onClose={() => { setModalOpen(false); setPendingConn(null); }}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default DiagramBuilder; 