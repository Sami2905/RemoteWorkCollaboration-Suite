import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Switch,
  useToast,
  SimpleGrid,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  IconButton,
  useColorMode,
  Select,
  Flex,
  Tooltip
} from '@chakra-ui/react'

const UserProfile = () => {
  const toast = useToast()
  const { colorMode, toggleColorMode } = useColorMode()
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Product Manager',
    department: 'Product Development',
    location: 'New York, USA',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced product manager with a passion for creating user-friendly solutions. Specializing in remote collaboration tools and productivity software.'
  })
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    soundAlerts: false,
    autoJoinMeetings: true,
    darkMode: colorMode === 'dark',
    language: 'en',
    availability: 'available',
    timeFormat: '12h'
  })
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'message', content: 'New message from Sarah: "Can we discuss the project timeline?"', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 2, type: 'task', content: 'Task "Update documentation" was assigned to you', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 3, type: 'meeting', content: 'Reminder: Team meeting in 15 minutes', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 4, type: 'document', content: 'Alex shared a document with you: "Q4 Strategy"', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
  ])

  // Sync dark mode with colorMode
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: colorMode === 'dark'
    }))
  }, [colorMode])

  const handleSaveProfile = () => {
    setIsEditing(false)
    toast({
      title: 'Profile updated',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
  }

  const handleSettingChange = (setting) => {
    if (setting === 'darkMode') {
      toggleColorMode()
      return
    }
    
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    })
    
    toast({
      title: `Setting updated`,
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }
  
  const handleSelectChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    })
    
    toast({
      title: `Setting updated`,
      status: 'info',
      duration: 2000,
      isClosable: true
    })
  }
  
  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }
  
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
    toast({
      title: 'Notification removed',
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }
  
  const clearAllNotifications = () => {
    setNotifications([])
    toast({
      title: 'All notifications cleared',
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
  }

  return (
    <Box>
      <Heading mb={6}>User Profile</Heading>
      
      <Tabs variant="enclosed" mb={6}>
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Settings</Tab>
          <Tab>Notifications {notifications.filter(n => !n.read).length > 0 && 
            <Badge ml={2} colorScheme="red" borderRadius="full">{notifications.filter(n => !n.read).length}</Badge>}
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Personal Information</Heading>
                <Button 
                  size="sm" 
                  colorScheme={isEditing ? "green" : "blue"}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </HStack>
              <HStack spacing={6} mb={6} align="flex-start">
                <Avatar size="xl" name={userData.name} />
                <VStack align="flex-start" spacing={1}>
                  <Heading size="md">{userData.name}</Heading>
                  <Text color="gray.600">{userData.role}</Text>
                  <Badge colorScheme="blue" mt={2}>{userData.department}</Badge>
                </VStack>
              </HStack>
                
              <VStack spacing={4} align="stretch">
                {isEditing ? (
                  <>
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input 
                        value={userData.name} 
                        onChange={(e) => setUserData({...userData, name: e.target.value})} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input 
                        value={userData.email} 
                        onChange={(e) => setUserData({...userData, email: e.target.value})} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <Input 
                        value={userData.role} 
                        onChange={(e) => setUserData({...userData, role: e.target.value})} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Department</FormLabel>
                      <Input 
                        value={userData.department} 
                        onChange={(e) => setUserData({...userData, department: e.target.value})} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input 
                        value={userData.location} 
                        onChange={(e) => setUserData({...userData, location: e.target.value})} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Input 
                        value={userData.phone} 
                        onChange={(e) => setUserData({...userData, phone: e.target.value})} 
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Bio</FormLabel>
                      <Input 
                        value={userData.bio} 
                        onChange={(e) => setUserData({...userData, bio: e.target.value})} 
                      />
                    </FormControl>
                  </>
                ) : (
                  <>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Email:</Text>
                      <Text>{userData.email}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Location:</Text>
                      <Text>{userData.location}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Phone:</Text>
                      <Text>{userData.phone}</Text>
                    </HStack>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Bio:</Text>
                      <Text>{userData.bio}</Text>
                    </Box>
                  </>
                )}
              </VStack>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading size="md" mb={4}>Notification Settings</Heading>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text>Email Notifications</Text>
                    <Switch 
                      isChecked={settings.emailNotifications} 
                      onChange={() => handleSettingChange('emailNotifications')} 
                      colorScheme="blue"
                    />
                  </HStack>
                  
                  <Divider />
                  
                  <HStack justify="space-between">
                    <Text>Desktop Notifications</Text>
                    <Switch 
                      isChecked={settings.desktopNotifications} 
                      onChange={() => handleSettingChange('desktopNotifications')} 
                      colorScheme="blue"
                    />
                  </HStack>
                  
                  <Divider />
                  
                  <HStack justify="space-between">
                    <Text>Sound Alerts</Text>
                    <Switch 
                      isChecked={settings.soundAlerts} 
                      onChange={() => handleSettingChange('soundAlerts')} 
                      colorScheme="blue"
                    />
                  </HStack>
                  
                  <Divider />
                  
                  <HStack justify="space-between">
                    <Text>Auto-join Meetings</Text>
                    <Switch 
                      isChecked={settings.autoJoinMeetings} 
                      onChange={() => handleSettingChange('autoJoinMeetings')} 
                      colorScheme="blue"
                    />
                  </HStack>
                  
                  <Divider />
                  
                  <HStack justify="space-between">
                    <Text>Dark Mode</Text>
                    <Switch 
                      isChecked={settings.darkMode} 
                      onChange={() => handleSettingChange('darkMode')} 
                      colorScheme="blue"
                    />
                  </HStack>
                </VStack>
              </Box>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Heading size="md" mb={4}>Application Settings</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select 
                      value={settings.language}
                      onChange={(e) => handleSelectChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </Select>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Availability Status</FormLabel>
                    <Select 
                      value={settings.availability}
                      onChange={(e) => handleSelectChange('availability', e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="away">Away</option>
                      <option value="offline">Appear Offline</option>
                    </Select>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Time Format</FormLabel>
                    <Select 
                      value={settings.timeFormat}
                      onChange={(e) => handleSelectChange('timeFormat', e.target.value)}
                    >
                      <option value="12h">12-hour (1:30 PM)</option>
                      <option value="24h">24-hour (13:30)</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Recent Notifications</Heading>
                {notifications.length > 0 && (
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    variant="outline"
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </Button>
                )}
              </Flex>
              
              {notifications.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={8}>No notifications</Text>
              ) : (
                <List spacing={3}>
                  {notifications.map((notification) => (
                    <ListItem 
                      key={notification.id} 
                      p={3} 
                      borderWidth="1px" 
                      borderRadius="md"
                      bg={notification.read ? "transparent" : "blue.50"}
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Flex align="center" mb={1}>
                            <Badge 
                              colorScheme={
                                notification.type === 'message' ? 'blue' : 
                                notification.type === 'task' ? 'green' : 
                                notification.type === 'meeting' ? 'orange' : 'purple'
                              }
                              mr={2}
                            >
                              {notification.type}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              {formatTimestamp(notification.timestamp)}
                            </Text>
                            {!notification.read && (
                              <Badge ml={2} colorScheme="red">New</Badge>
                            )}
                          </Flex>
                          <Text>{notification.content}</Text>
                        </Box>
                        <Flex>
                          {!notification.read && (
                            <Tooltip label="Mark as read">
                              <IconButton
                                aria-label="Mark as read"
                                icon={<Text>✓</Text>}
                                size="sm"
                                variant="ghost"
                                onClick={() => markNotificationAsRead(notification.id)}
                                mr={1}
                              />
                            </Tooltip>
                          )}
                          <Tooltip label="Delete">
                            <IconButton
                              aria-label="Delete notification"
                              icon={<Text>×</Text>}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => deleteNotification(notification.id)}
                            />
                          </Tooltip>
                        </Flex>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default UserProfile