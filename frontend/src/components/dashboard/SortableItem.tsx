import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import Card from '../ui/Card';
import type { PriorityItem } from '../../types/priorities';

interface SortableItemProps {
  item: PriorityItem;
}

export default function SortableItem({ item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardContent className="flex items-start gap-4 p-6">
          <button
            className="mt-1 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-muted">
            <span className="text-sm font-medium">{item.order}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className || 'p-6 pt-0'}>{children}</div>;
}
