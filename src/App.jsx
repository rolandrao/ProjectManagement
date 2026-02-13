import { GlassLayout } from './components/layout/GlassLayout';
import { KanbanBoard } from './components/board/KanbanBoard';

function App() {
  return (
    <GlassLayout>
      <KanbanBoard />
    </GlassLayout>
  );
}

export default App;