import { 
  Box, 
  Flex, 
  IconButton, 
  Avatar, 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack
} from '@chakra-ui/react'
import { FiBell } from 'react-icons/fi'

const Header = () => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="100%"
      px={4}
      bg="white"
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      h="60px"
    >
      <Text fontSize="xl" fontWeight="bold">
        Remote Work Collaboration Suite
      </Text>

      <HStack spacing={3}>
        <IconButton
          aria-label="Notifications"
          icon={<FiBell />}
          variant="ghost"
          size="md"
        />
        
        <Menu>
          <MenuButton>
            <Avatar size="sm" name="User" src="" />
          </MenuButton>
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Sign Out</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  )
}

export default Header