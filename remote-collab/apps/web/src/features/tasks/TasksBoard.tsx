import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { useSocket } from '../../context/SocketProvider'
import { useBoard } from './useBoard'

type Task = { id: string; title: string; columnId: string }
type Column = { id: string; title: string }

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="rounded-xl bg-white shadow p-3 mb-3 cursor-grab active:cursor-grabbing">
      <div className="font-medium">{task.title}</div>
    </div>
  )
}

export function TasksBoard({ workspaceId }: { workspaceId: string }) {
  const { data: boardData } = useBoard(workspaceId)
  const socket = useSocket()
  const [tasks, setTasks] = useState<Task[]>([])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // Initialize tasks from board data
  useEffect(() => {
    if (boardData) {
      const allTasks = boardData.columns.flatMap(col => 
        col.tasks.map(task => ({ id: task.id, title: task.title, columnId: col.id }))
      )
      setTasks(allTasks)
    }
  }, [boardData])

  const columns: Column[] = boardData?.columns.map(col => ({ id: col.id, title: col.title })) || []

  useEffect(() => {
    if (!socket) return
    const onMoved = ({ taskId, toColumnId, toIndex }: { taskId: string; toColumnId: string; toIndex: number }) => {
      setTasks(prev => {
        const moving = prev.find(t => t.id === taskId)!
        const others = prev.filter(t => t.id !== taskId)
        const targetList = others.filter(t => t.columnId === toColumnId)
        const before = others.filter(t => t.columnId !== toColumnId)
        const newList = [...targetList]
        newList.splice(toIndex, 0, { ...moving, columnId: toColumnId })
        return [...before, ...newList]
      })
    }
    socket.on('tasks:moved', onMoved)
    return () => { socket.off('tasks:moved', onMoved) }
  }, [workspaceId, socket])

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    const overIsTask = tasks.some(t => t.id === overId)
    let toColumnId = overIsTask ? tasks.find(t => t.id === overId)!.columnId : overId
    if (!columns.some(c => c.id === toColumnId)) {
      toColumnId = overId
    }

    setTasks(prev => {
      const moving = prev.find(t => t.id === activeId)!
      const listWithout = prev.filter(t => t.id !== activeId)
      const dest = listWithout.filter(t => t.columnId === toColumnId)
      const before = listWithout.filter(t => t.columnId !== toColumnId)
      const overIndex = overIsTask ? dest.findIndex(t => t.id === overId) : dest.length
      const nextDest = [...dest]
      nextDest.splice(overIndex, 0, { ...moving, columnId: toColumnId })
      if (socket) socket.emit('tasks:move', { workspaceId, taskId: activeId, toColumnId, toIndex: overIndex })
      return [...before, ...nextDest]
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {columns.map(col => {
          const items = tasks.filter(t => t.columnId === col.id)
          return (
            <div key={col.id} className="rounded-2xl bg-slate-50 p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{col.title}</h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                {items.map(task => <TaskCard key={task.id} task={task} />)}
              </SortableContext>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}


