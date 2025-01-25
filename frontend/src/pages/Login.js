import React from 'react'
import { Container,Logo,LeftContent,LoginText } from '../style/style'
import Logo1 from "../images/logo1.png"
import LoginField from '../components/LoginField'
import { useContext } from 'react';
 import { UserContext } from '../ContextState/contextState';
 import { AlertModal } from '../Alert/AlertModal';
function Login() {
    const userContext = useContext(UserContext);
  
  const {  Modal,SetModal } = userContext;
  const closeModal = () => {
    SetModal(false); // Close modal
  };

  return (
  <Container>
   <AlertModal
          isOpen={Modal}
          onClose={closeModal}
          title="Login Failed"
          message="The login attempt was unsuccessful. Please check your credentials and try again."
        />
<Logo src={Logo1} alt='Logo'/>
<LeftContent>

    <LoginText>Welcome Back!!</LoginText>
    <LoginField/>
</LeftContent>
  </Container>
  )
}

export default Login