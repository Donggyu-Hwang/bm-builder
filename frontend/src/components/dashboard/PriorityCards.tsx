import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { usePriorities } from '../../hooks/usePriorities';
import Button from '../ui/Button';
import Card from '../ui/Card';
import SortableItem from './SortableItem';

export default function PriorityCards() {
  const { items, save } = usePriorities();
  const [localItems, setLocalItems] = useState(items);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } }) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    await save(localItems);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            아직 우선순위가 없습니다. AI가 생성 중입니다...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localItems} strategy={verticalListSortingStrategy}>
          {localItems.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex justify-center">
        <Button onClick={handleSave} size="lg">
          변경사항 저장
        </Button>
      </div>
    </div>
  );
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className || 'p-6 pt-0'}>{children}</div>;
}
