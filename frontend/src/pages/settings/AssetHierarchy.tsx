import { ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface TreeNode {
  id: string;
  name: string;
  type: string;
  children?: TreeNode[];
}

const DEMO_TREE: TreeNode[] = [
  {
    id: '1', name: 'TIPER Terminal (Oryx)', type: 'TERMINAL',
    children: [
      {
        id: '1a', name: 'Tank Farm A', type: 'TANK_FARM',
        children: [
          { id: '1a1', name: 'TK-101.LVL', type: 'TAG' },
          { id: '1a2', name: 'TK-102.LVL', type: 'TAG' },
          { id: '1a3', name: 'TK-103.TEMP', type: 'TAG' },
        ],
      },
      {
        id: '1b', name: 'Loading Rack 1', type: 'LOADING_RACK',
        children: [
          { id: '1b1', name: 'LR1.FLOW', type: 'TAG' },
          { id: '1b2', name: 'LR1.TOTALIZER', type: 'TAG' },
        ],
      },
    ],
  },
  {
    id: '2', name: 'TAZAMA Pipeline', type: 'PIPELINE',
    children: [
      {
        id: '2a', name: 'Pump Station 3', type: 'PUMP_STATION',
        children: [
          { id: '2a1', name: 'PS3.FLOW', type: 'TAG' },
          { id: '2a2', name: 'PS3.PRESSURE', type: 'TAG' },
        ],
      },
    ],
  },
  {
    id: '3', name: 'Puma Energy Kurasini', type: 'TERMINAL',
    children: [
      {
        id: '3a', name: 'Tank Farm Section 1', type: 'TANK_FARM',
        children: [
          { id: '3a1', name: 'PK-TK01.LVL', type: 'TAG' },
        ],
      },
    ],
  },
];

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-sm hover:bg-accent"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren && (
          <ChevronRight className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} />
        )}
        {!hasChildren && <span className="w-3" />}
        <span className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-medium ${
          node.type === 'TAG' ? 'bg-blue-100 text-blue-800' :
          node.type === 'TERMINAL' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>{node.type}</span>
        <span>{node.name}</span>
      </button>
      {open && hasChildren && node.children!.map((child) => (
        <TreeItem key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function AssetHierarchy() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Hierarchy</h1>
          <p className="text-sm text-muted-foreground">Asset → System → Tag tree structure</p>
        </div>
        <button className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Asset
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tags..."
          className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        {DEMO_TREE.map((node) => (
          <TreeItem key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
