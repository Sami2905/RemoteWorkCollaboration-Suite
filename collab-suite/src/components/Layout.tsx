import { ReactNode } from 'react'
import { Box, Flex, useColorModeValue } from '@chakra-ui/react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Header />
        <Box 
          as="main" 
          p={4} 
          bg={useColorModeValue('gray.50', 'gray.800')}
          minH="calc(100vh - 60px)"
        >
          {children}
        </Box>
      </Box>
    </Flex>
  )
}

export default Layout