import { useState, useRef } from 'react'
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  IconButton,
  Flex,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Icon,
  Grid,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiCalendar, FiEdit, FiTrash2, FiMoreHorizontal } from 'react-icons/fi'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Define task type
interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  description?: string;
}

// Task Card Component with Drag and Drop functionality
const TaskCard = ({ task, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id.toString(),
    data: { task }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'green'
      default:
        return 'gray'
    }
  }

  return (
    <Box 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      p={4} 
      mb={3}
      borderWidth="1px" 
      borderRadius="md" 
      borderLeftWidth="4px"
      borderLeftColor={`${getPriorityColor(task.priority)}.500`}
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow="sm"
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
      _hover={{ boxShadow: 'md' }}
    >
      <Flex align="center">
        <Box flex="1">
          <Text fontWeight="semibold" mb={1}>
            {task.title}
          </Text>
          <HStack mt={2} spacing={2} flexWrap="wrap">
            <Badge colorScheme={
              task.status === 'To Do' ? 'blue' : 
              task.status === 'In Progress' ? 'yellow' : 
              'green'
            }>
              {task.status}
            </Badge>
            <Badge colorScheme={getPriorityColor(task.priority)}>{task.priority}</Badge>
            <HStack>
              <Icon as={FiCalendar} />
              <Text fontSize="xs">{task.dueDate}</Text>
            </HStack>
          </HStack>
          <Text fontSize="xs" mt={1} color="gray.500">Assignee: {task.assignee}</Text>
        </Box>
        <HStack>
          <IconButton 
            aria-label="Edit task" 
            icon={<FiEdit />} 
            size="sm" 
            variant="ghost"
            onClick={() => onEdit(task)}
          />
          <IconButton 
            aria-label="Delete task" 
            icon={<FiTrash2 />} 
            size="sm" 
            variant="ghost" 
            colorScheme="red"
            onClick={() => onDelete(task.id)}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

// Column Component
const Column = ({ title, tasks, columnId, searchQuery }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.100', 'gray.600');
  
  // Filter tasks by search query
  const filteredTasks = searchQuery 
    ? tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <Box 
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      height="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Box 
        p={3} 
        bg={headerBg} 
        borderBottomWidth="1px" 
        borderColor={borderColor}
      >
        <Flex align="center" justify="space-between">
          <Heading size="sm">{title}</Heading>
          <Badge colorScheme="blue" borderRadius="full" px={2}>
            {filteredTasks.length}
          </Badge>
        </Flex>
      </Box>
      <Box p={3} flex="1" overflowY="auto" maxH="calc(100vh - 300px)">
        <SortableContext items={filteredTasks.map(t => t.id.toString())} strategy={rectSortingStrategy}>
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={(task) => {}} 
              onDelete={(id) => {}}
            />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
};

const TaskManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Complete project proposal', status: 'In Progress', priority: 'High', dueDate: '2023-06-20', assignee: 'John Doe' },
    { id: 2, title: 'Review marketing materials', status: 'To Do', priority: 'Medium', dueDate: '2023-06-22', assignee: 'Jane Smith' },
    { id: 3, title: 'Prepare client presentation', status: 'In Progress', priority: 'High', dueDate: '2023-06-18', assignee: 'Robert Johnson' },
    { id: 4, title: 'Update website content', status: 'To Do', priority: 'Low', dueDate: '2023-06-25', assignee: 'Emily Davis' },
    { id: 5, title: 'Fix login page bug', status: 'Done', priority: 'High', dueDate: '2023-06-15', assignee: 'Michael Wilson' },
    { id: 6, title: 'Conduct user interviews', status: 'In Progress', priority: 'Medium', dueDate: '2023-06-23', assignee: 'Sarah Brown' },
    { id: 7, title: 'Create monthly report', status: 'Done', priority: 'Medium', dueDate: '2023-06-10', assignee: 'David Miller' },
    { id: 8, title: 'Design new landing page', status: 'To Do', priority: 'High', dueDate: '2023-06-28', assignee: 'Alex Turner' },
    { id: 9, title: 'Implement authentication', status: 'In Progress', priority: 'High', dueDate: '2023-06-19', assignee: 'Chris Evans' },
    { id: 10, title: 'Write documentation', status: 'To Do', priority: 'Medium', dueDate: '2023-06-30', assignee: 'Lisa Wong' }
  ])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const toast = useToast()
  
  const [newTask, setNewTask] = useState<Task>({
    id: 0,
    title: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    description: ''
  })

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Group tasks by status
  const todoTasks = tasks.filter(task => task.status === 'To Do')
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress')
  const doneTasks = tasks.filter(task => task.status === 'Done')

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeTaskId = parseInt(active.id.toString())
    const foundTask = tasks.find(task => task.id === activeTaskId)
    setActiveTask(foundTask || null)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id.toString()
    const overId = over.id.toString()
    
    if (activeId === overId) return
    
    const activeTaskId = parseInt(activeId)
    const activeTask = tasks.find(task => task.id === activeTaskId)
    
    if (!activeTask) return
    
    // Check if dropping on a column
    if (overId === 'To Do' || overId === 'In Progress' || overId === 'Done') {
      // Update task status
      setTasks(tasks.map(task => 
        task.id === activeTaskId ? { ...task, status: overId } : task
      ))
      
      toast({
        title: 'Task updated',
        description: `"${activeTask.title}" moved to ${overId}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    
    // Handle dropping on another task
    const overTaskId = parseInt(overId)
    const overTask = tasks.find(task => task.id === overTaskId)
    
    if (!overTask) return
    
    // If tasks are in different columns, update status
    if (activeTask.status !== overTask.status) {
      setTasks(tasks.map(task => 
        task.id === activeTaskId ? { ...task, status: overTask.status } : task
      ))
      
      toast({
        title: 'Task updated',
        description: `"${activeTask.title}" moved to ${overTask.status}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } else {
      // Reorder within the same column
      const activeIndex = tasks.findIndex(t => t.id === activeTaskId)
      const overIndex = tasks.findIndex(t => t.id === overTaskId)
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newTasks = arrayMove(tasks, activeIndex, overIndex)
        setTasks(newTasks)
      }
    }
  }

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    
    const task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      ...newTask
    }
    
    setTasks([...tasks, task])
    setNewTask({
      id: 0,
      title: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      assignee: '',
      description: ''
    })
    
    toast({
      title: 'Task added',
      description: `"${task.title}" has been added to ${task.status}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    
    onClose()
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
    
    toast({
      title: 'Task deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setNewTask(task)
    onOpen()
  }

  return (
    <Box>
      <Heading mb={6}>Task Management</Heading>
      
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search tasks by title or assignee" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Spacer />
        
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => {
          setEditingTask(null)
          setNewTask({
            id: 0,
            title: '',
            status: 'To Do',
            priority: 'Medium',
            dueDate: '',
            assignee: '',
            description: ''
          })
          onOpen()
        }}>
          Add Task
        </Button>
      </HStack>
      
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
          <Column 
            title="To Do" 
            tasks={todoTasks} 
            columnId="To Do"
            searchQuery={searchQuery}
          />
          <Column 
            title="In Progress" 
            tasks={inProgressTasks} 
            columnId="In Progress"
            searchQuery={searchQuery}
          />
          <Column 
            title="Done" 
            tasks={doneTasks} 
            columnId="Done"
            searchQuery={searchQuery}
          />
        </Grid>
        
        <DragOverlay>
          {activeTask ? (
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              borderLeftWidth="4px"
              borderLeftColor={activeTask.priority === 'High' ? 'red.500' : 
                              activeTask.priority === 'Medium' ? 'orange.500' : 'green.500'}
              bg="white"
              boxShadow="lg"
              width="300px"
            >
              <Text fontWeight="semibold">{activeTask.title}</Text>
              <HStack mt={2} spacing={2}>
                <Badge>{activeTask.status}</Badge>
                <Badge colorScheme={
                  activeTask.priority === 'High' ? 'red' : 
                  activeTask.priority === 'Medium' ? 'orange' : 'green'
                }>
                  {activeTask.priority}
                </Badge>
              </HStack>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingTask ? 'Edit Task' : 'Add New Task'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={newTask.description || ''} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select 
                  value={newTask.status} 
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select 
                  value={newTask.priority} 
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Assignee</FormLabel>
                <Input 
                  value={newTask.assignee} 
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} 
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddTask}>
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default TaskManagement