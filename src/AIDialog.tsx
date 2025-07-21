import React, { useState, useRef, useEffect } from 'react';
import { TableConfig, ColumnConfig } from './App';

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tables: TableConfig[], relationships: any[]) => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Simple SQL Parser
class SQLParser {
  static parseCreateTable(sql: string): TableConfig | null {
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\)/i;
    const match = sql.match(createTableRegex);
    
    if (!match) return null;
    
    const tableName = match[1];
    const columnsText = match[2];
    
    // Parse columns
    const columns: ColumnConfig[] = [];
    const columnLines = columnsText.split(',').map(line => line.trim());
    
    for (const line of columnLines) {
      if (line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('KEY')) {
        continue; // Skip constraint lines for now
      }
      
      const columnMatch = line.match(/`?(\w+)`?\s+(\w+)(?:\s*\([^)]+\))?(?:\s+(NOT\s+NULL|NULL))?/i);
      if (columnMatch) {
        const [, colName, colType, nullable] = columnMatch;
        columns.push({
          name: colName,
          type: colType.toUpperCase(),
          nullable: nullable?.toLowerCase().includes('null') || false,
          isPK: line.toLowerCase().includes('primary key'),
          isFK: line.toLowerCase().includes('foreign key')
        });
      }
    }
    
    return {
      id: Date.now().toString(),
      name: tableName,
      type: this.detectTableType(tableName, columns),
      scdType: 'none',
      columns,
      position: { x: 100, y: 100 }
    };
  }
  
  static detectTableType(tableName: string, columns: ColumnConfig[]): 'fact' | 'dimension' {
    const factKeywords = ['fact', 'transaction', 'event', 'log', 'metric', 'measure'];
    const dimensionKeywords = ['dim', 'dimension', 'lookup', 'reference', 'master'];
    
    const nameLower = tableName.toLowerCase();
    
    // Check table name
    if (factKeywords.some(keyword => nameLower.includes(keyword))) {
      return 'fact';
    }
    if (dimensionKeywords.some(keyword => nameLower.includes(keyword))) {
      return 'dimension';
    }
    
    // Check for ID columns (fact tables usually have fewer IDs)
    const idColumns = columns.filter(col => 
      col.name.toLowerCase().includes('id') && col.isPK
    ).length;
    
    return idColumns <= 2 ? 'fact' : 'dimension';
  }
}

// Natural Language Processor
class NLPProcessor {
  static processInput(input: string): { action: string; data: any } | null {
    const lowerInput = input.toLowerCase();
    
    // SQL detection
    if (lowerInput.includes('create table') || lowerInput.includes('sql')) {
      return { action: 'parse_sql', data: input };
    }
    
    // Natural language table creation
    if (lowerInput.includes('create table') || lowerInput.includes('add table')) {
      return { action: 'create_table_nl', data: input };
    }
    
    // Column addition
    if (lowerInput.includes('add column') || lowerInput.includes('add field')) {
      return { action: 'add_column', data: input };
    }
    
    // Relationship creation
    if (lowerInput.includes('relationship') || lowerInput.includes('foreign key') || lowerInput.includes('connect')) {
      return { action: 'create_relationship', data: input };
    }
    
    return { action: 'unknown', data: input };
  }
  
  static extractTableInfo(input: string): { name: string; columns: string[] } | null {
    // Simple pattern matching for "create table X with columns Y, Z"
    const tableMatch = input.match(/create\s+table\s+(\w+)(?:\s+with\s+columns?\s+(.+))?/i);
    if (!tableMatch) return null;
    
    const tableName = tableMatch[1];
    const columnsText = tableMatch[2] || '';
    const columns = columnsText.split(',').map(col => col.trim()).filter(col => col.length > 0);
    
    return { name: tableName, columns };
  }
}

export default function AIDialog({ isOpen, onClose, onSubmit }: AIDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you create ER diagrams using natural language or SQL. Try saying:\n\n• 'Create table users with columns id, name, email'\n• 'CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, amount DECIMAL)'\n• 'Add relationship between users and orders'",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const processInput = async (input: string) => {
    setIsProcessing(true);
    
    try {
      const result = NLPProcessor.processInput(input);
      
      if (!result) {
        addMessage('assistant', "I'm not sure how to process that. Try using SQL or natural language to create tables.");
        return;
      }
      
      switch (result.action) {
        case 'parse_sql':
          const table = SQLParser.parseCreateTable(input);
          if (table) {
            addMessage('assistant', `✅ Created table "${table.name}" with ${table.columns.length} columns. Type: ${table.type}`);
            onSubmit([table], []);
          } else {
            addMessage('assistant', "❌ Couldn't parse the SQL. Please check the syntax and try again.");
          }
          break;
          
        case 'create_table_nl':
          const tableInfo = NLPProcessor.extractTableInfo(input);
          if (tableInfo) {
            const columns: ColumnConfig[] = tableInfo.columns.map((col, index) => ({
              name: col,
              type: 'VARCHAR',
              nullable: true,
              isPK: index === 0, // First column as primary key
              isFK: false
            }));
            
            const newTable: TableConfig = {
              id: Date.now().toString(),
              name: tableInfo.name,
              type: SQLParser.detectTableType(tableInfo.name, columns),
              scdType: 'none',
              columns,
              position: { x: 100, y: 100 }
            };
            
            addMessage('assistant', `✅ Created table "${newTable.name}" with columns: ${columns.map(c => c.name).join(', ')}`);
            onSubmit([newTable], []);
          } else {
            addMessage('assistant', "❌ Couldn't understand the table structure. Try: 'Create table users with columns id, name, email'");
          }
          break;
          
        case 'add_column':
          addMessage('assistant', "🔄 Column addition feature coming soon! For now, you can add columns manually in the table interface.");
          break;
          
        case 'create_relationship':
          addMessage('assistant', "🔄 Relationship creation feature coming soon! For now, you can create relationships by dragging between table handles.");
          break;
          
        default:
          addMessage('assistant', "I'm not sure how to help with that. Try creating a table or ask for help!");
      }
    } catch (error) {
      addMessage('assistant', "❌ An error occurred while processing your request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    const userInput = inputValue.trim();
    addMessage('user', userInput);
    setInputValue('');
    
    // Process the input
    processInput(userInput);
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        width: '90%',
        maxWidth: 600,
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold'
            }}>
              AI
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>AI Assistant</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Create ER diagrams with natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
              padding: 4
            }}
          >
            ×
          </button>
        </div>
        
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {messages.map(message => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: 16,
                background: message.type === 'user' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#f8f9fa',
                color: message.type === 'user' ? '#fff' : '#333',
                fontSize: 14,
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap'
              }}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #eee'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Try: 'Create table users with columns id, name, email'"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none'
              }}
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              style={{
                padding: '12px 20px',
                background: isProcessing ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 