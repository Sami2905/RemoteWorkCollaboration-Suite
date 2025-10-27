import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Tooltip
} from '@chakra-ui/react'
import { FiFile, FiFileText, FiImage, FiSearch, FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiShare2, FiUsers } from 'react-icons/fi'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const DocumentCollaboration = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Project Proposal', type: 'doc', lastModified: '2023-06-15', sharedWith: 5 },
    { id: 2, name: 'Marketing Strategy', type: 'doc', lastModified: '2023-06-14', sharedWith: 3 },
    { id: 3, name: 'Budget Report', type: 'sheet', lastModified: '2023-06-12', sharedWith: 2 },
    { id: 4, name: 'Product Roadmap', type: 'sheet', lastModified: '2023-06-10', sharedWith: 4 },
    { id: 5, name: 'Team Meeting Notes', type: 'doc', lastModified: '2023-06-08', sharedWith: 8 },
    { id: 6, name: 'Logo Design', type: 'image', lastModified: '2023-06-05', sharedWith: 2 },
    { id: 7, name: 'Client Presentation', type: 'presentation', lastModified: '2023-06-03', sharedWith: 6 }
  ])
  const [currentDocument, setCurrentDocument] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: 'John Doe', color: '#4299E1' },
    { id: 2, name: 'Jane Smith', color: '#48BB78' }
  ])
  
  // Create a Yjs document and provider
  const ydoc = useRef(new Y.Doc())
  const providerRef = useRef(null)
  
  // Setup TipTap editor with Yjs collaboration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc.current,
      }),
      CollaborationCursor.configure({
        provider: providerRef.current,
        user: { 
          name: 'Current User', 
          color: '#F56565',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 400px; padding: 1rem;'
      },
    },
  })

  // Initialize WebSocket provider when a document is opened
  useEffect(() => {
    if (currentDocument && editor) {
      // Clean up previous provider if exists
      if (providerRef.current) {
        providerRef.current.destroy()
      }
      
      try {
        // Create a new provider with error handling
        providerRef.current = new WebsocketProvider(
          'wss://demos.yjs.dev', // Using a demo server for simplicity
          `document-${currentDocument.id}`,
          ydoc.current
        )
      } catch (error) {
        console.error('Failed to connect to collaboration server:', error);
      }
      
      // Set awareness information
      providerRef.current.awareness.setLocalStateField('user', {
        name: 'Current User',
        color: '#F56565',
      })
      
      // Update editor content
      editor.commands.setContent(`<h1>${currentDocument.name}</h1><p>Start collaborating on this document. Multiple users can edit simultaneously!</p>`)
      
      // Cleanup on unmount
      return () => {
        if (providerRef.current) {
          providerRef.current.destroy()
        }
      }
    }
  }, [currentDocument, editor])

  const getFileIcon = (type) => {
    switch (type) {
      case 'doc':
        return FiFileText
      case 'sheet':
        return FiFile
      case 'image':
        return FiImage
      default:
        return FiFile
    }
  }

  const openDocument = (doc) => {
    setCurrentDocument(doc)
    onOpen()
  }
  
  const createNewDocument = () => {
    const newDoc = {
      id: documents.length + 1,
      name: 'New Document',
      type: 'doc',
      lastModified: new Date().toISOString().split('T')[0],
      sharedWith: 1
    }
    setDocuments([...documents, newDoc])
    setCurrentDocument(newDoc)
    onOpen()
  }
  
  const deleteDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }
  
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box>
      <Heading mb={6}>Documents</Heading>
      
      <HStack mb={6} justify="space-between">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search documents" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={createNewDocument}>
          New Document
        </Button>
      </HStack>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Last Modified</Th>
            <Th>Shared With</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredDocuments.map((doc) => (
            <Tr key={doc.id}>
              <Td>
                <HStack>
                  <Icon as={getFileIcon(doc.type)} color="blue.500" />
                  <Text cursor="pointer" onClick={() => openDocument(doc)}>
                    {doc.name}
                  </Text>
                </HStack>
              </Td>
              <Td>{doc.lastModified}</Td>
              <Td>
                <Badge colorScheme="blue">{doc.sharedWith} people</Badge>
              </Td>
              <Td>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="ghost">
                    <Icon as={FiMoreVertical} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<Icon as={FiEdit} />} onClick={() => openDocument(doc)}>Edit</MenuItem>
                    <MenuItem icon={<Icon as={FiShare2} />}>Share</MenuItem>
                    <MenuItem icon={<Icon as={FiTrash2} />} color="red.500" onClick={() => deleteDocument(doc.id)}>Delete</MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      {currentDocument && (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{currentDocument.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex justify="flex-end" mb={4}>
                <HStack spacing={2} bg="gray.100" p={2} borderRadius="md">
                  <Icon as={FiUsers} />
                  <Text fontSize="sm">Active Users:</Text>
                  {activeUsers.map(user => (
                    <Tooltip key={user.id} label={user.name}>
                      <Box 
                        w="24px" 
                        h="24px" 
                        borderRadius="full" 
                        bg={user.color} 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        color="white"
                        fontWeight="bold"
                        fontSize="xs"
                      >
                        {user.name.charAt(0)}
                      </Box>
                    </Tooltip>
                  ))}
                </HStack>
              </Flex>
              
              <Box 
                border="1px" 
                borderColor="gray.200" 
                borderRadius="md" 
                p={4} 
                minH="500px"
                className="document-editor"
              >
                {editor && <EditorContent editor={editor} />}
              </Box>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button colorScheme="blue" mr={3}>
                  Save
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  )
}

export default DocumentCollaboration