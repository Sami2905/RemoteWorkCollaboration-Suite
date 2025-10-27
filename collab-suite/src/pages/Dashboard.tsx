import {
  Box,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  List,
  ListItem,
  ListIcon,
  HStack,
  Avatar,
  Badge,
  Icon,
  Flex,
  useColorModeValue
} from '@chakra-ui/react'
import { FiFileText, FiCheckSquare, FiCalendar, FiClock, FiUsers, FiCheckCircle } from 'react-icons/fi'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js'
import { Doughnut, Line, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title
)

const Dashboard = () => {
  // Colors for charts
  const chartColors = {
    blue: useColorModeValue('rgba(66, 153, 225, 0.6)', 'rgba(66, 153, 225, 0.8)'),
    green: useColorModeValue('rgba(72, 187, 120, 0.6)', 'rgba(72, 187, 120, 0.8)'),
    purple: useColorModeValue('rgba(159, 122, 234, 0.6)', 'rgba(159, 122, 234, 0.8)'),
    orange: useColorModeValue('rgba(237, 137, 54, 0.6)', 'rgba(237, 137, 54, 0.8)'),
    red: useColorModeValue('rgba(229, 62, 62, 0.6)', 'rgba(229, 62, 62, 0.8)'),
    gray: useColorModeValue('rgba(160, 174, 192, 0.6)', 'rgba(160, 174, 192, 0.8)')
  }

  // Task completion data
  const taskCompletionData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [18, 7, 5],
        backgroundColor: [chartColors.green, chartColors.blue, chartColors.gray],
        borderColor: ['rgba(72, 187, 120, 1)', 'rgba(66, 153, 225, 1)', 'rgba(160, 174, 192, 1)'],
        borderWidth: 1,
      },
    ],
  }

  // Team productivity data
  const productivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 8, 12, 7, 9, 3, 1],
        borderColor: 'rgba(72, 187, 120, 1)',
        backgroundColor: chartColors.green,
        tension: 0.4,
      },
      {
        label: 'Documents Edited',
        data: [3, 5, 7, 9, 6, 2, 0],
        borderColor: 'rgba(66, 153, 225, 1)',
        backgroundColor: chartColors.blue,
        tension: 0.4,
      }
    ],
  }

  // Project status data
  const projectStatusData = {
    labels: ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta'],
    datasets: [
      {
        label: 'Completion %',
        data: [75, 45, 90, 30],
        backgroundColor: [chartColors.blue, chartColors.orange, chartColors.green, chartColors.purple],
        borderWidth: 0,
      },
    ],
  }

  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '70%',
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Team Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Project Completion Status',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%'
          }
        }
      },
    },
  }

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
            <Stat>
              <StatLabel>Documents</StatLabel>
              <StatNumber>12</StatNumber>
              <StatHelpText>4 updated today</StatHelpText>
            </Stat>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
            <Stat>
              <StatLabel>Tasks</StatLabel>
              <StatNumber>24</StatNumber>
              <StatHelpText>8 due today</StatHelpText>
            </Stat>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
            <Stat>
              <StatLabel>Meetings</StatLabel>
              <StatNumber>3</StatNumber>
              <StatHelpText>Next: 2:00 PM</StatHelpText>
            </Stat>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
            <Stat>
              <StatLabel>Team Members</StatLabel>
              <StatNumber>8</StatNumber>
              <StatHelpText>5 online now</StatHelpText>
            </Stat>
        </Box>
      </SimpleGrid>
      
      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" height="300px">
          <Heading size="md" mb={4} textAlign="center">Task Status</Heading>
          <Box height="220px">
            <Doughnut data={taskCompletionData} options={doughnutOptions} />
          </Box>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" height="300px">
          <Heading size="md" mb={4} textAlign="center">Team Productivity</Heading>
          <Box height="220px">
            <Line data={productivityData} options={lineOptions} />
          </Box>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" height="300px">
          <Heading size="md" mb={4} textAlign="center">Project Status</Heading>
          <Box height="220px">
            <Bar data={projectStatusData} options={barOptions} />
          </Box>
        </Box>
      </SimpleGrid>
      
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>Recent Activity</Heading>
          <List spacing={3}>
              <ListItem>
                <HStack>
                  <ListIcon as={FiFileText} color="blue.500" />
                  <Text>Marketing Plan.docx was updated by Jane Smith</Text>
                  <Text fontSize="sm" color="gray.500">10 min ago</Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <ListIcon as={FiCheckSquare} color="green.500" />
                  <Text>Task "Finalize Q3 Report" was completed</Text>
                  <Text fontSize="sm" color="gray.500">1 hour ago</Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <ListIcon as={FiCalendar} color="purple.500" />
                  <Text>New meeting "Weekly Standup" scheduled</Text>
                  <Text fontSize="sm" color="gray.500">2 hours ago</Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <ListIcon as={FiFileText} color="blue.500" />
                  <Text>Project Proposal.pptx was created by John Doe</Text>
                  <Text fontSize="sm" color="gray.500">Yesterday</Text>
                </HStack>
              </ListItem>
              <ListItem>
                <HStack>
                  <ListIcon as={FiClock} color="orange.500" />
                  <Text>Task "Client Meeting Preparation" deadline updated</Text>
                  <Text fontSize="sm" color="gray.500">Yesterday</Text>
                </HStack>
              </ListItem>
            </List>
        </Box>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
          <Heading size="md" mb={4}>Team Status</Heading>
          <List spacing={3}>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="John Doe" />
                    <Text>John Doe</Text>
                  </HStack>
                  <Badge colorScheme="green">Online</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="Jane Smith" />
                    <Text>Jane Smith</Text>
                  </HStack>
                  <Badge colorScheme="green">Online</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="Robert Johnson" />
                    <Text>Robert Johnson</Text>
                  </HStack>
                  <Badge colorScheme="green">Online</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="Emily Davis" />
                    <Text>Emily Davis</Text>
                  </HStack>
                  <Badge colorScheme="green">Online</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="Michael Wilson" />
                    <Text>Michael Wilson</Text>
                  </HStack>
                  <Badge colorScheme="green">Online</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="Sarah Brown" />
                    <Text>Sarah Brown</Text>
                  </HStack>
                  <Badge colorScheme="red">Offline</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="David Miller" />
                    <Text>David Miller</Text>
                  </HStack>
                  <Badge colorScheme="red">Offline</Badge>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Avatar size="sm" name="Lisa Taylor" />
                    <Text>Lisa Taylor</Text>
                  </HStack>
                  <Badge colorScheme="red">Offline</Badge>
                </Flex>
              </ListItem>
            </List>
        </Box>
      </Grid>
    </Box>
  )
}

export default Dashboard