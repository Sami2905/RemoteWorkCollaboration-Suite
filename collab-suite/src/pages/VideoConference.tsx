import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Grid,
  Heading,
  Button,
  Flex,
  Text,
  HStack,
  VStack,
  Avatar,
  IconButton,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMessageSquare, FiShare, FiUsers, FiSettings } from 'react-icons/fi'

const VideoConference = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [roomName, setRoomName] = useState('team-meeting')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John Doe', isOnline: true },
    { id: 2, name: 'Jane Smith', isOnline: true },
    { id: 3, name: 'Robert Johnson', isOnline: true },
    { id: 4, name: 'Emily Davis', isOnline: true },
    { id: 5, name: 'Michael Wilson', isOnline: true }
  ])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Initialize media devices when joining meeting
  useEffect(() => {
    if (isInMeeting && !localStream) {
      initializeMediaDevices()
    }
    
    return () => {
      // Clean up media streams when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isInMeeting])

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      })
      
      setLocalStream(stream)
      
      // Set initial audio/video state based on user preferences
      stream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled
      })
      
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled
      })
      
      setErrorMessage('')
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setErrorMessage('Could not access camera or microphone. Please check permissions.')
      
      toast({
        title: 'Media Error',
        description: 'Could not access camera or microphone',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled
      })
    }
    
    setIsAudioEnabled(!isAudioEnabled)
    toast({
      title: isAudioEnabled ? 'Audio muted' : 'Audio unmuted',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top'
    })
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled
      })
    }
    
    setIsVideoEnabled(!isVideoEnabled)
    toast({
      title: isVideoEnabled ? 'Video turned off' : 'Video turned on',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top'
    })
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenShareRef.current && screenShareRef.current.srcObject) {
        const tracks = (screenShareRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
        screenShareRef.current.srcObject = null
      }
      setIsScreenSharing(false)
      toast({
        title: 'Screen sharing stopped',
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'top'
      })
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }
        
        // Add event listener for when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          toast({
            title: 'Screen sharing stopped',
            status: 'info',
            duration: 2000,
            isClosable: true,
            position: 'top'
          })
        }
        
        setIsScreenSharing(true)
        toast({
          title: 'Screen sharing started',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top'
        })
      } catch (error) {
        console.error('Error sharing screen:', error)
        toast({
          title: 'Screen sharing failed',
          description: 'Could not share your screen',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        })
      }
    }
  }

  const joinMeeting = () => {
    setIsInMeeting(true)
    toast({
      title: 'Joined meeting',
      description: `You have joined ${roomName}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top'
    })
  }

  const leaveMeeting = () => {
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    // Stop screen sharing if active
    if (isScreenSharing && screenShareRef.current && screenShareRef.current.srcObject) {
      const tracks = (screenShareRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      screenShareRef.current.srcObject = null
      setIsScreenSharing(false)
    }
    
    setIsInMeeting(false)
    toast({
      title: 'Left meeting',
      description: 'You have left the meeting',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top'
    })
  }

  return (
    <Box p={5}>
      <Heading mb={6}>Video Conference</Heading>
      
      {!isInMeeting ? (
        <Flex direction="column" align="center" justify="center" p={10} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={6}>Join Meeting</Heading>
          <FormControl mb={4}>
            <FormLabel>Meeting Room</FormLabel>
            <Input 
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter meeting room name"
              width="300px"
            />
          </FormControl>
          <Button 
            colorScheme="blue" 
            leftIcon={<FiVideo />}
            onClick={joinMeeting}
            size="lg"
          >
            Join Meeting
          </Button>
        </Flex>
      ) : (
        <Grid templateColumns="3fr 1fr" gap={4}>
          <Box>
            {/* Main video area */}
            <Box 
              borderWidth={1} 
              borderRadius="lg" 
              overflow="hidden" 
              bg="gray.700" 
              height="500px"
              position="relative"
            >
              {/* Local video */}
              <Box 
                as="video"
                ref={videoRef}
                autoPlay
                muted
                playsInline
                width="100%"
                height="100%"
                objectFit="cover"
                display={isVideoEnabled ? "block" : "none"}
              />
              
              {/* Screen share video */}
              {isScreenSharing && (
                <Box 
                  as="video"
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  width="100%"
                  height="100%"
                  objectFit="contain"
                  position="absolute"
                  top="0"
                  left="0"
                  zIndex="1"
                  bg="black"
                />
              )}
              
              {/* Video placeholder when video is off */}
              {!isVideoEnabled && !isScreenSharing && (
                <Flex 
                  align="center" 
                  justify="center" 
                  height="100%" 
                  bg="gray.800"
                >
                  <Avatar size="2xl" name="User" />
                </Flex>
              )}
              
              {/* Error message */}
              {errorMessage && (
                <Flex 
                  position="absolute" 
                  bottom="4" 
                  left="0" 
                  right="0" 
                  justify="center"
                >
                  <Text 
                    bg="red.500" 
                    color="white" 
                    px={4} 
                    py={2} 
                    borderRadius="md"
                  >
                    {errorMessage}
                  </Text>
                </Flex>
              )}
            </Box>
            
            {/* Controls */}
            <Flex justify="center" mt={4} p={2} borderWidth={1} borderRadius="lg">
              <HStack spacing={4}>
                <IconButton
                  aria-label={isAudioEnabled ? "Mute" : "Unmute"}
                  icon={isAudioEnabled ? <FiMic /> : <FiMicOff />}
                  onClick={toggleAudio}
                  colorScheme={isAudioEnabled ? "green" : "red"}
                  size="lg"
                  isRound
                />
                <IconButton
                  aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
                  icon={isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
                  onClick={toggleVideo}
                  colorScheme={isVideoEnabled ? "green" : "red"}
                  size="lg"
                  isRound
                />
                <IconButton
                  aria-label={isScreenSharing ? "Stop sharing" : "Share screen"}
                  icon={<FiShare />}
                  onClick={toggleScreenShare}
                  colorScheme={isScreenSharing ? "purple" : "gray"}
                  size="lg"
                  isRound
                />
                <IconButton
                  aria-label="Chat"
                  icon={<FiMessageSquare />}
                  onClick={onOpen}
                  colorScheme="blue"
                  size="lg"
                  isRound
                />
                <IconButton
                  aria-label="Leave meeting"
                  icon={<FiPhoneOff />}
                  onClick={leaveMeeting}
                  colorScheme="red"
                  size="lg"
                  isRound
                />
              </HStack>
            </Flex>
          </Box>
          
          {/* Participants list */}
          <Box borderWidth={1} borderRadius="lg" p={4} height="500px" overflowY="auto">
            <Flex align="center" mb={4}>
              <FiUsers />
              <Heading size="md" ml={2}>Participants ({participants.length})</Heading>
            </Flex>
            <VStack align="stretch" spacing={3}>
              {participants.map(participant => (
                <Flex 
                  key={participant.id} 
                  align="center" 
                  p={2} 
                  borderWidth={1} 
                  borderRadius="md"
                >
                  <Avatar size="sm" name={participant.name} mr={3} />
                  <Text fontWeight="medium">{participant.name}</Text>
                  <Box ml="auto">
                    {participant.isOnline && (
                      <Box w={2} h={2} borderRadius="full" bg="green.400" />
                    )}
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Grid>
      )}
      
      {/* Chat Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Meeting Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4} height="300px" overflowY="auto">
              <Flex>
                <Avatar size="sm" name="John Doe" mr={2} />
                <Box bg="gray.100" p={2} borderRadius="md" maxW="80%">
                  <Text fontSize="xs" fontWeight="bold">John Doe</Text>
                  <Text>Hello everyone! Let's discuss the project timeline.</Text>
                </Box>
              </Flex>
              <Flex>
                <Avatar size="sm" name="Jane Smith" mr={2} />
                <Box bg="gray.100" p={2} borderRadius="md" maxW="80%">
                  <Text fontSize="xs" fontWeight="bold">Jane Smith</Text>
                  <Text>I think we should focus on the core features first.</Text>
                </Box>
              </Flex>
              <Flex justify="flex-end">
                <Box bg="blue.100" p={2} borderRadius="md" maxW="80%">
                  <Text fontSize="xs" fontWeight="bold">You</Text>
                  <Text>I agree with Jane. Let's prioritize the core features.</Text>
                </Box>
              </Flex>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex width="100%">
              <Input placeholder="Type your message..." mr={2} />
              <Button colorScheme="blue">Send</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
    <Box>
      <Heading mb={6}>Video Conference</Heading>
      
      {!isInMeeting ? (
        <VStack spacing={6} align="center" justify="center" h="60vh">
          <Heading size="md">Ready to join?</Heading>
          <Button colorScheme="blue" size="lg" onClick={joinMeeting}>
            Join Meeting
          </Button>
        </VStack>
      ) : (
        <>
          <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={6}>
            <Box>
              <Flex 
                direction="column" 
                bg="gray.700" 
                borderRadius="md" 
                h="60vh" 
                justify="center" 
                align="center"
                position="relative"
              >
                {isVideoEnabled ? (
                  <Text fontSize="xl" color="white">Your video feed would appear here</Text>
                ) : (
                  <VStack>
                    <Avatar size="2xl" name="User" />
                    <Text color="white">Camera Off</Text>
                  </VStack>
                )}
                
                <HStack 
                  position="absolute" 
                  bottom="4" 
                  spacing={4} 
                  bg="blackAlpha.600" 
                  p={3} 
                  borderRadius="full"
                >
                  <IconButton
                    aria-label={isAudioEnabled ? 'Mute' : 'Unmute'}
                    icon={isAudioEnabled ? <FiMic /> : <FiMicOff />}
                    onClick={toggleAudio}
                    colorScheme={isAudioEnabled ? 'green' : 'red'}
                    isRound
                    size="lg"
                  />
                  <IconButton
                    aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    icon={isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
                    onClick={toggleVideo}
                    colorScheme={isVideoEnabled ? 'green' : 'red'}
                    isRound
                    size="lg"
                  />
                  <IconButton
                    aria-label="End call"
                    icon={<FiPhoneOff />}
                    onClick={leaveMeeting}
                    colorScheme="red"
                    isRound
                    size="lg"
                  />
                  <IconButton
                    aria-label="Chat"
                    icon={<FiMessageSquare />}
                    colorScheme="blue"
                    isRound
                    size="lg"
                  />
                </HStack>
              </Flex>
            </Box>
            
            <VStack spacing={4} align="stretch">
              <Heading size="md">Participants (5)</Heading>
              <Box bg="gray.100" borderRadius="md" p={3}>
                <HStack>
                  <Avatar size="sm" name="John Doe" />
                  <Text>John Doe</Text>
                </HStack>
              </Box>
              <Box bg="gray.100" borderRadius="md" p={3}>
                <HStack>
                  <Avatar size="sm" name="Jane Smith" />
                  <Text>Jane Smith</Text>
                </HStack>
              </Box>
              <Box bg="gray.100" borderRadius="md" p={3}>
                <HStack>
                  <Avatar size="sm" name="Robert Johnson" />
                  <Text>Robert Johnson</Text>
                </HStack>
              </Box>
              <Box bg="gray.100" borderRadius="md" p={3}>
                <HStack>
                  <Avatar size="sm" name="Emily Davis" />
                  <Text>Emily Davis</Text>
                </HStack>
              </Box>
              <Box bg="gray.100" borderRadius="md" p={3}>
                <HStack>
                  <Avatar size="sm" name="Michael Wilson" />
                  <Text>Michael Wilson</Text>
                </HStack>
              </Box>
            </VStack>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default VideoConference