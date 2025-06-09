import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';

// 🎨 Цвета для слоев
const LAYER_COLORS = {
  business: '#2196F3',    // Blue
  financial: '#4CAF50',   // Green  
  education: '#FF9800',   // Orange
  gaming: '#9C27B0',      // Purple
  ai: '#FFEB3B',          // Yellow
  system: '#F44336'       // Red
};

// 📊 Данные узлов (таблиц)
const initialNodes: Node[] = [
  // Business Layer (Blue) - Center-left
  { 
    id: 'user', 
    position: { x: 200, y: 200 }, 
    data: { 
      label: '👥 Users\n(Central Neuron)',
      description: 'Пользователи системы - игроки, тренеры, администраторы'
    }, 
    style: { 
      background: LAYER_COLORS.business, 
      color: 'white', 
      border: '3px solid #1976D2',
      borderRadius: '10px',
      padding: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
      width: 120,
      height: 80
    },
    type: 'default'
  },
  { 
    id: 'booking', 
    position: { x: 400, y: 150 }, 
    data: { 
      label: '📅 Bookings',
      description: 'Бронирования кортов'
    }, 
    style: { 
      background: LAYER_COLORS.business, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'booking_participant', 
    position: { x: 400, y: 250 }, 
    data: { 
      label: '👥 Booking\nParticipants',
      description: 'Участники бронирований'
    }, 
    style: { 
      background: LAYER_COLORS.business, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'user_account_link', 
    position: { x: 50, y: 300 }, 
    data: { 
      label: '🔗 Account\nLinks',
      description: 'Связи с внешними аккаунтами'
    }, 
    style: { 
      background: LAYER_COLORS.business, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },

  // Financial Layer (Green) - Right side
  { 
    id: 'venue', 
    position: { x: 600, y: 100 }, 
    data: { 
      label: '🏢 Venues',
      description: 'Площадки и клубы'
    }, 
    style: { 
      background: LAYER_COLORS.financial, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'court', 
    position: { x: 750, y: 150 }, 
    data: { 
      label: '🎾 Courts',
      description: 'Корты для игры'
    }, 
    style: { 
      background: LAYER_COLORS.financial, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'payment', 
    position: { x: 550, y: 250 }, 
    data: { 
      label: '💰 Payments',
      description: 'Платежи и транзакции'
    }, 
    style: { 
      background: LAYER_COLORS.financial, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'product', 
    position: { x: 700, y: 300 }, 
    data: { 
      label: '🛍️ Products',
      description: 'Товары и услуги'
    }, 
    style: { 
      background: LAYER_COLORS.financial, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'order', 
    position: { x: 850, y: 250 }, 
    data: { 
      label: '🛒 Orders',
      description: 'Заказы пользователей'
    }, 
    style: { 
      background: LAYER_COLORS.financial, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },

  // Education Layer (Orange) - Top
  { 
    id: 'class_definition', 
    position: { x: 300, y: 50 }, 
    data: { 
      label: '🎓 Classes',
      description: 'Определения классов и тренировок'
    }, 
    style: { 
      background: LAYER_COLORS.education, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'training_package_definition', 
    position: { x: 450, y: 50 }, 
    data: { 
      label: '📦 Training\nPackages',
      description: 'Пакеты тренировок'
    }, 
    style: { 
      background: LAYER_COLORS.education, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },

  // Gaming Layer (Purple) - Bottom right
  { 
    id: 'game_session', 
    position: { x: 600, y: 400 }, 
    data: { 
      label: '🎮 Game\nSessions',
      description: 'Игровые сессии'
    }, 
    style: { 
      background: LAYER_COLORS.gaming, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'tournament', 
    position: { x: 750, y: 400 }, 
    data: { 
      label: '🏆 Tournaments',
      description: 'Турниры и соревнования'
    }, 
    style: { 
      background: LAYER_COLORS.gaming, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'rating_change', 
    position: { x: 400, y: 450 }, 
    data: { 
      label: '📈 Rating\nChanges',
      description: 'Изменения рейтинга'
    }, 
    style: { 
      background: LAYER_COLORS.gaming, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },

  // AI/Analytics Layer (Yellow) - Bottom left
  { 
    id: 'ai_suggestion_log', 
    position: { x: 50, y: 400 }, 
    data: { 
      label: '🤖 AI\nSuggestions',
      description: 'Логи AI рекомендаций'
    }, 
    style: { 
      background: LAYER_COLORS.ai, 
      color: 'black',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'feedback', 
    position: { x: 200, y: 450 }, 
    data: { 
      label: '💬 Feedback',
      description: 'Отзывы и оценки'
    }, 
    style: { 
      background: LAYER_COLORS.ai, 
      color: 'black',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },

  // System Layer (Red) - Far right
  { 
    id: 'notification', 
    position: { x: 900, y: 150 }, 
    data: { 
      label: '🔔 Notifications',
      description: 'Уведомления пользователей'
    }, 
    style: { 
      background: LAYER_COLORS.system, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'task', 
    position: { x: 900, y: 350 }, 
    data: { 
      label: '📋 Tasks',
      description: 'Задачи и поручения'
    }, 
    style: { 
      background: LAYER_COLORS.system, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  },
  { 
    id: 'external_system_mapping', 
    position: { x: 50, y: 500 }, 
    data: { 
      label: '🔗 External\nMappings',
      description: 'Маппинг внешних систем'
    }, 
    style: { 
      background: LAYER_COLORS.system, 
      color: 'white',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '11px'
    } 
  }
];

// 🔗 Связи между таблицами
const initialEdges: Edge[] = [
  // User-centered connections (User as central neuron)
  { id: 'user-booking', source: 'user', target: 'booking', label: 'books', type: 'smoothstep' },
  { id: 'user-payment', source: 'user', target: 'payment', label: 'pays', type: 'smoothstep' },
  { id: 'user-feedback', source: 'user', target: 'feedback', label: 'gives', type: 'smoothstep' },
  { id: 'user-ai', source: 'user', target: 'ai_suggestion_log', label: 'gets AI', type: 'smoothstep' },
  { id: 'user-rating', source: 'user', target: 'rating_change', label: 'rating', type: 'smoothstep' },
  { id: 'user-notification', source: 'user', target: 'notification', label: 'receives', type: 'smoothstep' },
  { id: 'user-task', source: 'user', target: 'task', label: 'assigned', type: 'smoothstep' },
  
  // Venue-Court hierarchy
  { id: 'venue-court', source: 'venue', target: 'court', label: 'contains', type: 'smoothstep' },
  { id: 'court-booking', source: 'court', target: 'booking', label: 'booked', type: 'smoothstep' },
  { id: 'court-game', source: 'court', target: 'game_session', label: 'hosts', type: 'smoothstep' },
  
  // Booking flow
  { id: 'booking-participant', source: 'booking', target: 'booking_participant', label: 'has', type: 'smoothstep' },
  { id: 'booking-payment', source: 'booking', target: 'payment', label: 'paid by', type: 'smoothstep' },
  
  // Gaming connections
  { id: 'game-rating', source: 'game_session', target: 'rating_change', label: 'affects', type: 'smoothstep' },
  { id: 'tournament-game', source: 'tournament', target: 'game_session', label: 'includes', type: 'smoothstep' },
  
  // Education connections
  { id: 'class-user', source: 'class_definition', target: 'user', label: 'teaches', type: 'smoothstep' },
  { id: 'training-user', source: 'training_package_definition', target: 'user', label: 'bought by', type: 'smoothstep' },
  
  // Product connections
  { id: 'user-order', source: 'user', target: 'order', label: 'orders', type: 'smoothstep' },
  { id: 'order-product', source: 'order', target: 'product', label: 'contains', type: 'smoothstep' },
];

const DatabaseVisualization: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex' }}>
      {/* Main diagram */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#f0f0f0" gap={20} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.style?.background) return node.style.background as string;
              return '#666';
            }}
            maskColor="rgba(255, 255, 255, 0.8)"
          />
        </ReactFlow>
      </div>

      {/* Info panel */}
      <div style={{ 
        width: '300px', 
        background: '#f5f5f5', 
        padding: '20px',
        borderLeft: '1px solid #ddd',
        overflow: 'auto'
      }}>
        <h3>🎨 Database Schema Visualization</h3>
        <p><strong>📊 Total Models:</strong> 31</p>
        <p><strong>🏝️ Project:</strong> Phangan Padel Tennis Club</p>
        
        <h4>🎨 Layers:</h4>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '20px', height: '20px', background: LAYER_COLORS.business, marginRight: '10px', borderRadius: '3px' }}></div>
            <span>Business (4 tables)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '20px', height: '20px', background: LAYER_COLORS.financial, marginRight: '10px', borderRadius: '3px' }}></div>
            <span>Financial (9 tables)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '20px', height: '20px', background: LAYER_COLORS.education, marginRight: '10px', borderRadius: '3px' }}></div>
            <span>Education (5 tables)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '20px', height: '20px', background: LAYER_COLORS.gaming, marginRight: '10px', borderRadius: '3px' }}></div>
            <span>Gaming (6 tables)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '20px', height: '20px', background: LAYER_COLORS.ai, marginRight: '10px', borderRadius: '3px' }}></div>
            <span>AI/Analytics (2 tables)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '20px', height: '20px', background: LAYER_COLORS.system, marginRight: '10px', borderRadius: '3px' }}></div>
            <span>System (3 tables)</span>
          </div>
        </div>

        {selectedNode && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'white', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h4>📋 Selected Table:</h4>
            <p><strong>Name:</strong> {selectedNode.data.label}</p>
            <p><strong>Description:</strong> {selectedNode.data.description}</p>
            <p><strong>ID:</strong> {selectedNode.id}</p>
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>🧠 <strong>"Второй Мозг" Architecture</strong></p>
          <p>👥 User table is the central neuron connecting all other models</p>
          <p>🔄 Real-time sync with Obsidian</p>
          <p>🎨 Color-coded by functional layers</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseVisualization;
