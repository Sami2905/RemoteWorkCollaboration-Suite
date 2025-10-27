import { 
  Box, 
  Flex, 
  Icon, 
  Link, 
  Text
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiVideo, 
  FiFileText, 
  FiCheckSquare, 
  FiUser 
} from 'react-icons/fi'

const NavItem = ({ icon, children, path }: { icon: any; children: string; path: string }) => {
  const location = useLocation()
  const isActive = location.pathname === path
  const activeColor = 'blue.500'
  const inactiveColor = 'gray.600'
  
  return (
    <Link
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'blue.50' : 'transparent'}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: 'blue.50',
          color: activeColor,
        }}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

const Sidebar = () => {
  const bgColor = 'white'
  const borderColor = 'gray.200'

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      w="60"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      overflowY="auto"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          RWC Suite
        </Text>
      </Flex>
      <Flex
        direction="column"
        as="nav"
        fontSize="sm"
        color="gray.600"
        aria-label="Main Navigation"
        mt="8"
      >
        <NavItem icon={FiHome} path="/">
          Dashboard
        </NavItem>
        <NavItem icon={FiVideo} path="/video-conference">
          Video Conference
        </NavItem>
        <NavItem icon={FiFileText} path="/documents">
          Documents
        </NavItem>
        <NavItem icon={FiCheckSquare} path="/tasks">
          Tasks
        </NavItem>
        <NavItem icon={FiUser} path="/profile">
          Profile
        </NavItem>
      </Flex>
    </Box>
  )
}

export default Sidebar