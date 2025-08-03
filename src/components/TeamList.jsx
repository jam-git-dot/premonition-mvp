// src/components/TeamList.jsx
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
  } from '@dnd-kit/core'
  import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
  } from '@dnd-kit/sortable'
  import {
    restrictToVerticalAxis,
    restrictToWindowEdges,
  } from '@dnd-kit/modifiers'
  import TeamItem from './TeamItem'
  
  function TeamList({ teams, setTeams }) {
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8, // 8px of movement before drag starts
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    )
  
    function handleDragEnd(event) {
      const { active, over } = event
  
      if (active.id !== over.id) {
        setTeams((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id)
          const newIndex = items.findIndex((item) => item.id === over.id)
  
          return arrayMove(items, oldIndex, newIndex)
        })
      }
    }
  
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Premier League Table Prediction
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Drag teams to reorder • 1st = Champions • 20th = Relegated
          </p>
        </div>
  
        {/* Draggable Team List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext
            items={teams.map(team => team.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-100">
              {teams.map((team, index) => (
                <TeamItem
                  key={team.id}
                  team={team}
                  position={index + 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    )
  }
  
  export default TeamList